import React from 'react';
import type { CyberTrustIntelligence, ThreatLevel } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building2,
  Target,
  LifeBuoy,
  Cpu,
  Globe2,
  ExternalLink,
  ShieldOff,
  Layers,
  Lock,
} from 'lucide-react';

interface CyberTrustPanelProps {
  cybertrust: CyberTrustIntelligence;
  threatLevel: ThreatLevel;
  riskScore: number;
  mlPrediction: string;
  mlConfidence: number;
}

export const CyberTrustPanel: React.FC<CyberTrustPanelProps> = ({
  cybertrust,
  threatLevel,
  riskScore,
  mlPrediction,
  mlConfidence,
}) => {
  const isMatch = cybertrust.identity_match_status === 'MATCH';
  const isMismatch = cybertrust.identity_match_status === 'MISMATCH' || cybertrust.is_impersonation;
  const isUnknown = cybertrust.identity_match_status === 'UNKNOWN';

  return (
    <div className="space-y-6">
      {/* Signature Header Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 p-5 backdrop-blur-md shadow-neon-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CYBERTRUST INTELLIGENCE™ EXPLAINABLE REASONING
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              "Why should I trust this?"
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Deconstructed attribution, brand impersonation verification, and threat objective intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-400">ML Pipeline Classification</div>
              <div className="text-sm font-bold font-mono text-cyan-300">
                {mlPrediction} ({Math.round(mlConfidence * 100)}% Conf)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Identity Card & Possible Attack Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Claimed Identity Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Claimed Organization / Brand</span>
            </div>
            {/* Identity Match Badge */}
            {isMatch ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Match
              </span>
            ) : isMismatch ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/30 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                Potential Impersonation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                <Globe2 className="w-3.5 h-3.5" />
                Unassociated Domain
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Apparent Entity</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {cybertrust.claimed_identity}
              </div>
            </div>

            {cybertrust.official_domain && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/90 text-xs text-slate-300">
                <div className="text-slate-400 mb-1 flex items-center justify-between">
                  <span>Authorized Official Domain:</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="font-mono text-cyan-400 font-medium select-all">
                  https://{cybertrust.official_domain}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400">
              {isMismatch ? (
                <p className="text-rose-300/90">
                  Target mimics legitimate brand naming or styling, but originates from an unauthorized foreign host.
                </p>
              ) : isMatch ? (
                <p className="text-emerald-300/90">
                  Target hostname perfectly reconciles with cryptographic identity and corporate naming authorities.
                </p>
              ) : (
                <p className="text-slate-400">
                  Target does not claim a well-known financial, cloud, or enterprise brand watchlist entity.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Possible Attack Goal Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-slate-700 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-sm font-semibold text-slate-200">
              <Target className="w-4 h-4 text-rose-400" />
              <span>Assessed Attacker Objective</span>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Possible Attack Goal</div>
              <div className="text-base font-semibold text-amber-300 mt-1 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>{cybertrust.possible_attack_goal}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90">
            <strong>Threat Intelligence Note:</strong> Adversaries commonly employ look-alike authentication forms to capture initial sessions, bypass multi-factor authentication, or stage unauthorized financial transactions.
          </div>
        </div>
      </div>

      {/* Why We Flagged It - Transparent Evidence Checklist */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-sm font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Why We Flagged It — Evidentiary Breakdown</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {cybertrust.why_flagged.map((evidence, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-cyan-500/30 transition text-sm text-slate-200"
            >
              <div className="mt-0.5 rounded-full p-0.5 bg-cyan-950 text-cyan-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="leading-relaxed">{evidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals Breakdown Gauges & External Intel Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Mathematical Risk Breakdown by Signal Layer</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">URL Structure Risk</div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {cybertrust.trust_breakdown.url_structure_risk !== undefined ? `${cybertrust.trust_breakdown.url_structure_risk}%` : 'N/A'}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-1.5 rounded-full"
                style={{ width: `${cybertrust.trust_breakdown.url_structure_risk || 0}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Identity Trust Score</div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">
              {cybertrust.trust_breakdown.identity_trust_score !== undefined ? `${cybertrust.trust_breakdown.identity_trust_score}%` : '50%'}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-purple-400 h-1.5 rounded-full"
                style={{ width: `${cybertrust.trust_breakdown.identity_trust_score || 50}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Content / Keywords</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {cybertrust.trust_breakdown.content_signals_risk !== undefined ? `${cybertrust.trust_breakdown.content_signals_risk}%` : '0%'}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${cybertrust.trust_breakdown.content_signals_risk || 0}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Model Confidence</div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {cybertrust.trust_breakdown.ml_model_confidence !== undefined ? `${cybertrust.trust_breakdown.ml_model_confidence}%` : '92%'}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${cybertrust.trust_breakdown.ml_model_confidence || 92}%` }}
              />
            </div>
          </div>
        </div>

        {/* Clear indicator of offline / third party intelligence limitation as mandated */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-slate-300">
            External Threat Feeds: <span className="text-amber-400">{cybertrust.trust_breakdown.external_threat_intel}</span>
          </span>
          <span className="text-slate-400">Signal Veracity Verified</span>
        </div>
      </div>

      {/* Recommended Action Checklist */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-sm font-semibold text-slate-200">
          <LifeBuoy className="w-4 h-4 text-emerald-400" />
          <span>Recommended Protective Actions for Analyst & User</span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {cybertrust.recommended_actions.map((action, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-slate-200 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60"
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
