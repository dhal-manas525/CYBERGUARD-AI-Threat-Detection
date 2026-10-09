import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Info, CheckCircle2,
  FileText, Download, ChevronDown, ChevronUp, Copy, Check,
  ExternalLink, Sparkles, Cpu, Layers, HelpCircle, Activity, Box, Bot
} from 'lucide-react';
import { ScanResultPayload } from '../types';
import { HolographicRiskOrb3D } from './HolographicRiskOrb3D';
import { CyberShield3D } from './CyberShield3D';

interface ScanResultViewProps {
  result: ScanResultPayload;
  onOpenReportModal: () => void;
  onResetScan: () => void;
  onOpenAssistant?: () => void;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  result,
  onOpenReportModal,
  onResetScan,
  onOpenAssistant
}) => {
  const [showFeatureVector, setShowFeatureVector] = useState(false);
  const [show3DShield, setShow3DShield] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  const {
    risk_score,
    risk_level,
    threat_type,
    model_confidence,
    score_breakdown,
    cybertrust,
    ml_result,
    signals,
    features,
    attack_goal,
    explanation,
    recommendations,
    limitations,
    probe_results,
    nlp_analysis
  } = result;

  // Color schemes based on Risk Level
  const getRiskColors = () => {
    switch (risk_level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/80',
          text: 'text-rose-400',
          badge: 'bg-rose-950 text-rose-300 border-rose-800',
          gaugeGradient: 'from-rose-500 via-red-600 to-amber-500',
          indicator: 'bg-rose-500'
        };
      case 'HIGH RISK':
        return {
          bg: 'bg-orange-950/40',
          border: 'border-orange-800/80',
          text: 'text-orange-400',
          badge: 'bg-orange-950 text-orange-300 border-orange-800',
          gaugeGradient: 'from-orange-500 via-amber-600 to-yellow-500',
          indicator: 'bg-orange-500'
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-800/80',
          text: 'text-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          gaugeGradient: 'from-amber-400 to-yellow-500',
          indicator: 'bg-amber-400'
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-800/80',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          gaugeGradient: 'from-emerald-400 to-teal-500',
          indicator: 'bg-emerald-400'
        };
    }
  };

  const colors = getRiskColors();

  const handleCopyTarget = () => {
    if (result.target) {
      navigator.clipboard.writeText(result.target);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `cyberguard-scan-${result.scan_id}.json`);
    dlAnchor.click();
  };

  const toggleAction = (idx: number) => {
    setCompletedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Header Card */}
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 shadow-2xl relative overflow-hidden backdrop-blur`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Target Identity & Classification */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${colors.badge} uppercase tracking-wider`}>
                {risk_level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                THREAT TYPE: {threat_type.replace(/_/g, ' ')}
              </span>
              {cybertrust.impersonation_detected && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-900/60 border border-rose-700 text-rose-200 animate-pulse">
                  🚨 POTENTIAL IMPERSONATION
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-mono break-all flex items-center gap-2">
              <span>{result.target || 'Target Analyzed'}</span>
              <button
                onClick={handleCopyTarget}
                title="Copy target"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </h2>

            <p className="text-xs text-slate-300 font-medium">
              Scan ID: <span className="font-mono text-cyan-400">{result.scan_id}</span> • Engine:{' '}
              <span className="text-slate-200">CyberGuard v2.4 + CyberTrust Intelligence™</span>
            </p>
          </div>

          {/* Dual Score Card: Risk Score vs Model Confidence */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
            {/* 3D Holographic Risk Orb */}
            <div className="text-center flex flex-col items-center">
              <HolographicRiskOrb3D score={risk_score} level={risk_level} />
              <div className="text-xs font-black uppercase text-slate-200 mt-1">
                COMPOSITE RISK SCORE
              </div>
              <div className={`text-[10px] font-bold ${colors.text}`}>
                {risk_level}
              </div>
            </div>

            <div className="hidden sm:block h-24 w-px bg-slate-800" />

            {/* Distinction Column: Model Confidence & Signal Weighting */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  ML Model Confidence:
                </span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {model_confidence}% {ml_result?.predicted_class || 'CALIBRATED'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Attack Goal:
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {attack_goal || cybertrust.attack_goal}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5">
                Composite Risk combines ML + CyberTrust™ + Heuristics.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generate SOC Incident Report</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON Evidence</span>
            </button>
            <button
              onClick={() => setShow3DShield(!show3DShield)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                show3DShield
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Box className="h-3.5 w-3.5 text-indigo-400" />
              <span>{show3DShield ? 'Hide 3D Matrix' : 'View 3D Matrix'}</span>
            </button>
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Ask CYBERGUARD AI</span>
              </button>
            )}
          </div>

          <button
            onClick={onResetScan}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Start New Scan
          </button>
        </div>
      </div>

      {/* 3D HOLOGRAPHIC DEFENSE MATRIX & THREAT TELEMETRY */}
      {show3DShield && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                3D Threat Particle Matrix & Interception Geometry
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              STATUS: {risk_level} • ROTATE WITH MOUSE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <CyberShield3D status={risk_level} score={risk_score} compact={false} />
            </div>

            <div className="lg:col-span-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Threat Trajectory</span>
                <div className="text-sm font-bold text-white font-mono">
                  {threat_type.replace(/_/g, ' ')}
                </div>
                <p className="text-[11px] text-slate-400">
                  {risk_level === 'CRITICAL' || risk_level === 'HIGH RISK'
                    ? 'Adversarial vectors targeting authentication channel detected in active telemetry.'
                    : 'Signals within standard benign boundaries. No malicious diversion intercepted.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Shield State</span>
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className={`h-2 w-2 rounded-full ${colors.indicator} animate-ping`} />
                  <span className={colors.text}>{risk_level} BARRIER</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Model Confidence: <span className="text-cyan-300 font-bold">{model_confidence}%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                Click and drag inside the 3D viewport to inspect the geometric particle nodes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIGNATURE SECTION: CYBERTRUST INTELLIGENCE™ */}
      <div className="rounded-2xl border border-cyan-800/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  CYBERTRUST INTELLIGENCE™
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SIGNATURE DIFFERENTIATOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Answers: <em>"Why should I trust this?"</em> and <em>"Who is behind it?"</em>
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Brand Match Score</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {cybertrust.brand_similarity_score}% Match
            </div>
          </div>
        </div>

        {/* Identity Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Box 1: Claimed Identity */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              CLAIMED IDENTITY
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{cybertrust.claimed_identity || 'No Recognized Brand Claimed'}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {cybertrust.brand_entity ? (
                <>
                  Category: <span className="text-slate-300">{cybertrust.brand_entity.category}</span>
                </>
              ) : (
                'Generic internet host without explicit enterprise footprint'
              )}
            </div>
          </div>

          {/* Box 2: Identity Analysis Verdict */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              IDENTITY ANALYSIS
            </div>
            <div className="text-base font-bold flex items-center gap-1.5">
              {cybertrust.impersonation_status === 'OFFICIAL_VERIFIED' || cybertrust.impersonation_status === 'OFFICIAL_SUBDOMAIN' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Legitimate Official Domain
                </span>
              ) : cybertrust.impersonation_status === 'TYPOSQUATTING_DETECTED' ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Typosquatting / Look-alike
                </span>
              ) : cybertrust.impersonation_status === 'POTENTIAL_IMPERSONATION' ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Potential Impersonation
                </span>
              ) : (
                <span className="text-slate-300">Unrelated / Independent Entity</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {cybertrust.verdict_summary}
            </div>
          </div>

          {/* Box 3: Possible Attack Goal */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              ESTIMATED ATTACK GOAL
            </div>
            <div className="text-base font-bold text-amber-300">
              {cybertrust.attack_goal}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Calculated from keyword intent, auth forms, and brand profile.
            </div>
          </div>
        </div>

        {/* Official Domains Comparison vs Target Domain */}
        {cybertrust.claimed_identity && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="font-semibold text-slate-300 mb-2">
              Official Domains Registry vs Observed Target:
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Verified Official Domains for {cybertrust.claimed_identity}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cybertrust.official_domains.map(od => (
                    <span key={od} className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-mono">
                      https://{od}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Observed Registered Host:</span>
                <span className={`font-mono font-bold ${cybertrust.trust_signals.is_official_domain ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {features?.domain_registered || result.target}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Why We Flagged It bullet points */}
        {cybertrust.why_flagged.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>WHY WE FLAGGED IT:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {cybertrust.why_flagged.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* EXPLAINABLE AI LAYER & FORENSIC EVIDENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Explainable AI Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Explainable AI Layer</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              {explanation.model_name}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
            {explanation.executive_summary}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Forensic Threat Narrative:
              </span>
              <p className="text-slate-400 leading-relaxed">
                {explanation.threat_narrative}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Attacker Intent Analysis:
              </span>
              <p className="text-slate-400 leading-relaxed">
                {explanation.attacker_intent_breakdown}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Recommended Actions Interactive Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Recommended Incident Actions</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Interactive Guidance Checklist
            </span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, idx) => {
              const isChecked = completedActions[idx] || false;
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-400 line-through'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="leading-relaxed font-medium">{rec}</span>
                </div>
              );
            })}
          </div>

          {limitations.length > 0 && (
            <div className="pt-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-400">Safety & Limitation Notice: </span>
              {limitations[0]}
            </div>
          )}
        </div>
      </div>

      {/* DETECTED SIGNALS FORENSIC TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>Detected Forensic Signals & Rule Triggers ({signals.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Indicator</th>
                <th className="py-2.5 px-3">Forensic Explanation</th>
                <th className="py-2.5 px-3 text-right">Score Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {signals.map((sig, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sig.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : sig.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : sig.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {sig.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {sig.indicator}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 leading-relaxed">
                    {sig.explanation}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                    <span className={sig.points > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {sig.points > 0 ? `+${sig.points}` : sig.points} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXTRACTED FEATURE VECTOR ACCORDION (24 FEATURES) */}
      {features && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <button
            onClick={() => setShowFeatureVector(!showFeatureVector)}
            className="w-full flex items-center justify-between text-left text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>Inspecting Extracted Feature Vector (24 Structural & Lexical Attributes)</span>
            </div>
            {showFeatureVector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showFeatureVector && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">URL Length</span>
                  <span className="text-white font-bold">{features.url_length} chars</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Domain Length</span>
                  <span className="text-white font-bold">{features.domain_length} chars</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Subdomains</span>
                  <span className="text-white font-bold">{features.num_subdomains}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Hyphen Count</span>
                  <span className="text-white font-bold">{features.num_hyphens}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Shannon Entropy</span>
                  <span className="text-cyan-400 font-bold">{features.domain_entropy} bits</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">IP Address Host</span>
                  <span className={features.is_ip_address ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {features.is_ip_address ? 'TRUE (ANOMALY)' : 'FALSE'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">HTTPS Protocol</span>
                  <span className={features.is_https ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {features.is_https ? 'TRUE (TLS)' : 'FALSE (HTTP)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">High-Abuse TLD</span>
                  <span className={features.suspicious_tld_flag ? 'text-rose-400 font-bold' : 'text-slate-300 font-bold'}>
                    .{features.tld || 'none'} {features.suspicious_tld_flag ? '(FLAGGED)' : ''}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Auth Keywords</span>
                  <span className="text-white font-bold">{features.matched_keywords.join(', ') || 'None'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Numeric Ratio</span>
                  <span className="text-white font-bold">{Math.round(features.digit_ratio * 100)}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Special Chars</span>
                  <span className="text-white font-bold">{Math.round(features.special_char_ratio * 100)}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">@ Authority Mask</span>
                  <span className="text-white font-bold">{features.num_at_symbols}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
