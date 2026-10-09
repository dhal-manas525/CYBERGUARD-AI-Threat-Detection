import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Building,
  Globe,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Fingerprint,
  FileWarning,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import type { ImpersonationResponse } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Link } from 'react-router-dom';
import { validateImpersonationInput } from '../utils/validators';

const DEMO_SAMPLES = [
  {
    label: 'SBI KYC Phishing (Typosquat)',
    org: 'State Bank of India (SBI)',
    target: 'http://onlinesbi-kyc-verification-portal.com/login.php',
    desc: 'Hyphenated domain spoofing SBI netbanking'
  },
  {
    label: 'PayPal Account Alert (.top TLD)',
    org: 'PayPal',
    target: 'http://paypal-account-security-alert-center.top/signin',
    desc: 'Deceptive subdomain & high-risk TLD'
  },
  {
    label: 'Microsoft Homoglyph (micr0s0ft)',
    org: 'Microsoft',
    target: 'http://micr0s0ft-security-auth.net/login',
    desc: 'Numeral 0 substituting for vowel o'
  },
  {
    label: 'Legitimate PayPal Portal',
    org: 'PayPal',
    target: 'https://www.paypal.com/signin',
    desc: 'Official verified corporate infrastructure'
  }
];

export const DigitalImpersonationPage: React.FC = () => {
  const [claimedOrg, setClaimedOrg] = useState('State Bank of India (SBI)');
  const [target, setTarget] = useState('http://onlinesbi-kyc-verification-portal.com/login.php');
  const [autoIncident, setAutoIncident] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImpersonationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScan = async (orgToScan?: string, targetToScan?: string) => {
    const validation = validateImpersonationInput(o, t);
    if (!validation.isValid) {
      setError(validation.error || 'Please provide both the claimed organization and a valid destination target.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanImpersonation(o, t, autoIncident);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setClaimedOrg(sample.org);
    setTarget(sample.target);
    handleScan(sample.org, sample.target);
  };

  const copyIncidentId = () => {
    if (result?.incident_id) {
      navigator.clipboard.writeText(result.incident_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
          <Fingerprint className="w-4 h-4" />
          Scenario B — Identity Verification & Homoglyph Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Digital Impersonation Analyzer
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-3xl">
          Verify whether an incoming communication, sender domain, or web link legitimately belongs
          to the claimed organization or is an attacker operating lookalike typosquatting and homoglyph decoys.
        </p>
      </div>

      {/* Quick Sample Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          1-Click Live Demonstration Scenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s)}
              className="text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all text-xs group"
            >
              <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {s.label}
              </div>
              <div className="text-slate-400 mt-1 line-clamp-1">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  Claimed Organization / Entity
                </span>
              </label>
              <input
                type="text"
                value={claimedOrg}
                onChange={(e) => setClaimedOrg(e.target.value)}
                placeholder="e.g. State Bank of India, PayPal, Microsoft, Netflix"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Observed URL, Domain, or Sender
                </span>
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. http://onlinesbi-kyc-verify.com/login.php or support@paypal-alerts.net"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoIncident}
                onChange={(e) => setAutoIncident(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Automatically escalate High/Critical threats to Incident Management</span>
            </label>

            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  Execute CyberTrust Verification
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Verdict Banner */}
            <div
              className={`p-6 rounded-2xl border backdrop-blur-md ${
                result.threat_level === 'SAFE'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : result.threat_level === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    {result.threat_level === 'SAFE' ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <ThreatBadge level={result.threat_level} />
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900/80 font-mono text-slate-300 border border-slate-700">
                        VERDICT: {result.match_status}
                      </span>
                      {result.incident_id && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 font-mono text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5">
                          ESCALATED: {result.incident_id}
                          <button onClick={copyIncidentId} title="Copy Incident ID">
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                          </button>
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {result.threat_category}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Destination: <span className="font-mono text-white">{result.target_host}</span> | Claimed Entity: <span className="font-semibold text-white">{result.claimed_organization}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Composite Risk</div>
                  <div className="text-3xl font-black text-white font-mono">
                    {result.risk_score}<span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Key Attribution Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deconstructed Attribution */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400 tracking-wider">
                  <Building className="w-4 h-4" />
                  Canonical Namespace
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-slate-400">Claimed Organization:</div>
                    <div className="font-semibold text-white text-sm">{result.claimed_organization}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Official Registered Domains:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.official_domains.map((dom, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Observed Destination Host:</div>
                    <div className="font-mono text-cyan-300 text-xs break-all bg-slate-950 p-2 rounded-lg mt-1 border border-slate-800">
                      {result.target_host}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Domain String Similarity:</div>
                    <div className="text-base font-bold text-white font-mono">
                      {(result.similarity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Homoglyph & Typosquatting Breakdown */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-purple-400 tracking-wider">
                  <Fingerprint className="w-4 h-4" />
                  Homoglyphs & Character Deception
                </div>
                {result.homoglyphs_detected && result.homoglyphs_detected.length > 0 ? (
                  <div className="space-y-2.5">
                    {result.homoglyphs_detected.map((h, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs">
                        <div className="flex items-center justify-between text-purple-300 font-mono font-bold">
                          <span>'{h.character}' → mimics '{h.substitutes_for}'</span>
                          <span className="text-[10px] uppercase bg-purple-900/50 px-1.5 py-0.5 rounded">Lookalike</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1">{h.explanation}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                    No visual character substitutions (homoglyphs) discovered in the domain string.
                  </div>
                )}
                <div>
                  <div className="text-slate-400 text-xs">Assessed Attacker Goal:</div>
                  <div className="text-xs text-amber-300 font-medium mt-1 bg-amber-950/20 p-2 rounded-lg border border-amber-800/30">
                    {result.threat_objective}
                  </div>
                </div>
              </div>

              {/* Recommended SOC Mitigation */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Response Playbook
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.recommended_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                {result.incident_id && (
                  <div className="pt-2">
                    <Link
                      to="/incidents"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                    >
                      View in Incident Management Center <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Evidentiary Checklist */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-400" />
                Evidentiary Forensic Signals
              </div>
              <div className="space-y-2">
                {result.evidentiary_breakdown.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-cyan-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DigitalImpersonationPage;
