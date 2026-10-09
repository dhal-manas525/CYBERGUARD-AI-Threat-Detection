import React, { useState } from 'react';
import { Mail, ArrowRight, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { RiskGauge } from '../components/scanner/RiskGauge';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';
import { QuickSamplePills } from '../components/scanner/QuickSamplePills';
import type { DemoSample } from '../services/demoData';
import { validateEmailInput, validateUrlInput } from '../utils/validators';

export const EmailAnalyzerPage: React.FC = () => {
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rawLinks, setRawLinks] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Strict email sender and content validation
    const validation = validateEmailInput(sender, subject, body);
    if (!validation.isValid) {
      setError(validation.error || 'Please provide a valid sender email address and content.');
      setScanResult(null);
      return;
    }

    const linksList = rawLinks
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const link of linksList) {
      const linkVal = validateUrlInput(link);
      if (!linkVal.isValid) {
        setError(`Embedded link '${link}' is invalid: ${linkVal.error}`);
        setScanResult(null);
        return;
      }
    }

    setError(null);
    setIsAnalyzing(true);
    setScanResult(null);

    try {
      const data = await api.scanEmail(sender, subject, body, linksList);
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to analyze email.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: DemoSample) => {
    if (sample.payload) {
      setSender(sample.payload.sender || '');
      setSubject(sample.payload.subject || '');
      setBody(sample.payload.body || '');
      setRawLinks('http://onlinesbi-kyc-verification-portal.com/login.php');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Mail className="w-4 h-4" />
          <span>ADVANCED EMAIL THREAT DECONSTRUCTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Email Phishing & Spoofing Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspects sender-domain alignment, social-engineering coercion, and embedded credential lures.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-neon-cyan">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                From / Sender Address
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="security-alert@onlinesbi-notice.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="URGENT: Mandatory NetBanking KYC update required"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Email Body Content
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste email message text here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-sans placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Extracted Hyperlinks (One per line, optional)
            </label>
            <textarea
              rows={2}
              value={rawLinks}
              onChange={(e) => setRawLinks(e.target.value)}
              placeholder="http://example-verify-login.xyz"
              className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition shadow-neon-cyan"
            >
              <Send className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Email...' : 'Inspect Email Threat'}</span>
            </button>
          </div>
        </form>

        {/* Demo Mode Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <QuickSamplePills onSelectSample={handleSelectSample} filterType="email" />
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
                  Email Telemetry Overview
                </div>
                <div className="text-base font-bold text-white">
                  {scanResult.threat_category}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block">Sender Spoofing</span>
                    <span className="font-semibold text-rose-300">
                      {scanResult.extracted_features.is_spoofed ? 'Detected' : 'Clean'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block">Urgency Triggers</span>
                    <span className="font-semibold text-amber-300 font-mono">
                      {scanResult.extracted_features.urgency_triggers}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block">Credential Solicitations</span>
                    <span className="font-semibold text-rose-300 font-mono">
                      {scanResult.extracted_features.credential_triggers}
                    </span>
                  </div>
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
