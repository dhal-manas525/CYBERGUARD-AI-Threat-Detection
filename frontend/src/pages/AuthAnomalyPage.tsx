import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Users,
  Server,
  Zap,
  Globe2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  Code2,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import type { AuthEvent, AuthAnomalyResponse } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Link } from 'react-router-dom';

export const AuthAnomalyPage: React.FC = () => {
  const [demoScenarios, setDemoScenarios] = useState<Record<string, AuthEvent[]>>({});
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('password_spraying');
  const [eventsJson, setEventsJson] = useState<string>('');
  const [autoIncident, setAutoIncident] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthAnomalyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load pre-configured demo scenarios from backend
    api.getAuthDemoScenarios().then((scenarios) => {
      setDemoScenarios(scenarios);
      if (scenarios['password_spraying']) {
        setEventsJson(JSON.stringify(scenarios['password_spraying'], null, 2));
      }
    }).catch(() => {
      // Fallback local baseline if offline
    });
  }, []);

  const handleSelectScenario = (key: string) => {
    setSelectedScenarioKey(key);
    if (demoScenarios[key]) {
      const formatted = JSON.stringify(demoScenarios[key], null, 2);
      setEventsJson(formatted);
      executeAnalysis(demoScenarios[key]);
    }
  };

  const executeAnalysis = async (eventsToAnalyze?: AuthEvent[]) => {
    let parsedEvents: AuthEvent[] = [];
    if (eventsToAnalyze) {
      parsedEvents = eventsToAnalyze;
    } else {
      try {
        parsedEvents = JSON.parse(eventsJson);
        if (!Array.isArray(parsedEvents)) {
          throw new Error('Events must be an array of authentication event objects.');
        }
      } catch (err: any) {
        setError(`Invalid JSON format: ${err.message}`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanAuthEvents(parsedEvents, autoIncident);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Telemetry inspection failed.');
    } finally {
      setLoading(false);
    }
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
          <Activity className="w-4 h-4" />
          Scenario C — Technical Security Threat & Abnormal Behavior
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Authentication-Event Anomaly Detector
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-3xl">
          Inspect batch authentication event logs for distributed password spraying across user accounts,
          credential brute-forcing, impossible travel velocity hops, and automated adversary tool signatures.
        </p>
      </div>

      {/* Preset 1-Click Scenario Buttons */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          1-Click Synthetic Telemetry Scenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSelectScenario('password_spraying')}
            className={`text-left p-3 rounded-lg border transition-all text-xs group ${
              selectedScenarioKey === 'password_spraying'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-red-500/40 text-slate-300'
            }`}
          >
            <div className="font-semibold text-white group-hover:text-red-300 flex items-center justify-between">
              Password Spraying Attack
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">
                Critical
              </span>
            </div>
            <div className="text-slate-400 mt-1 line-clamp-1">Single IP rotates across 5 distinct executive accounts</div>
          </button>

          <button
            onClick={() => handleSelectScenario('brute_force')}
            className={`text-left p-3 rounded-lg border transition-all text-xs group ${
              selectedScenarioKey === 'brute_force'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-amber-500/40 text-slate-300'
            }`}
          >
            <div className="font-semibold text-white group-hover:text-amber-300 flex items-center justify-between">
              Brute Force Guessing
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">
                High Risk
              </span>
            </div>
            <div className="text-slate-400 mt-1 line-clamp-1">Burst of 6 consecutive failures on admin account</div>
          </button>

          <button
            onClick={() => handleSelectScenario('impossible_travel')}
            className={`text-left p-3 rounded-lg border transition-all text-xs group ${
              selectedScenarioKey === 'impossible_travel'
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-purple-500/40 text-slate-300'
            }`}
          >
            <div className="font-semibold text-white group-hover:text-purple-300 flex items-center justify-between">
              Impossible Travel
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                Geo Hop
              </span>
            </div>
            <div className="text-slate-400 mt-1 line-clamp-1">NY then Moscow in 15 mins ({'>'}900 km/h)</div>
          </button>

          <button
            onClick={() => handleSelectScenario('benign_baseline')}
            className={`text-left p-3 rounded-lg border transition-all text-xs group ${
              selectedScenarioKey === 'benign_baseline'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-emerald-500/40 text-slate-300'
            }`}
          >
            <div className="font-semibold text-white group-hover:text-emerald-300 flex items-center justify-between">
              Authorized Baseline
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                Safe
              </span>
            </div>
            <div className="text-slate-400 mt-1 line-clamp-1">Expected corporate employee logins</div>
          </button>
        </div>
      </div>

      {/* Editor & Scan Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
            <Code2 className="w-4 h-4 text-cyan-400" />
            Batch Telemetry JSON Input
          </div>
          <div className="text-xs text-slate-400">
            Supports fields: <code className="text-cyan-300">username</code>, <code className="text-cyan-300">ip_address</code>, <code className="text-cyan-300">location</code>, <code className="text-cyan-300">status</code>, <code className="text-cyan-300">user_agent</code>
          </div>
        </div>

        <textarea
          value={eventsJson}
          onChange={(e) => setEventsJson(e.target.value)}
          rows={9}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
          placeholder="Paste array of JSON login events..."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
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
            onClick={() => executeAnalysis()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Telemetry...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Inspect Auth Events
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Score Banner */}
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
                        EVENTS: {result.total_events}
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
                    <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                      {result.summary}
                    </p>
                  </div>
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Anomaly Score</div>
                  <div className="text-3xl font-black text-white font-mono">
                    {result.anomaly_score}<span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Identified Vectors
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.attack_vectors.length > 0 ? (
                    result.attack_vectors.map((vec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 font-mono text-xs border border-amber-800/50">
                        {vec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Targeted Accounts ({result.affected_accounts.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.affected_accounts.length > 0 ? (
                    result.affected_accounts.map((acc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-xs border border-slate-700">
                        {acc}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No specific accounts targeted</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Server className="w-4 h-4 text-purple-400" />
                  Offending Source IPs ({result.offending_ips.length})
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.offending_ips.length > 0 ? (
                    result.offending_ips.map((ip, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 font-mono text-xs border border-purple-800/50">
                        {ip}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No anomalous IPs detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Detected Anomalies Timeline */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Detected Security Anomalies ({result.anomalies_detected.length})
              </div>

              {result.anomalies_detected.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No security anomalies detected. Telemetry conforms to authorized operational baseline.
                </div>
              ) : (
                <div className="space-y-3">
                  {result.anomalies_detected.map((anom, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                              anom.severity === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {anom.severity}
                          </span>
                          <span className="font-bold text-white text-sm">{anom.title}</span>
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(anom.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{anom.description}</p>

                      <div className="flex items-center gap-4 text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Target: <span className="font-mono text-cyan-300">{anom.affected_account}</span></span>
                        <span>Source: <span className="font-mono text-purple-300">{anom.offending_ip}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Containment & Playbook */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Prioritized SOC Containment Playbook
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.recommended_response.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              {result.incident_id && (
                <div className="pt-3">
                  <Link
                    to="/incidents"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                  >
                    Manage escalated incident in SOC tracking center <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AuthAnomalyPage;
