import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, AlertTriangle, CheckCircle2, Search,
  FileText, ExternalLink, RefreshCw, BarChart2, ShieldCheck, Zap
} from 'lucide-react';
import { DashboardStatsData, ScanRecordItem } from '../types';

interface DashboardViewProps {
  onSelectScan: (scanId: string) => void;
  onOpenReport: (scanId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectScan, onOpenReport }) => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [scans, setScans] = useState<ScanRecordItem[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [filterType]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch(`/api/scans?type=${filterType}`).then(res => res.json())
    ])
      .then(([statsData, scansData]) => {
        setStats(statsData);
        setScans(scansData.scans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredScans = scans.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.target.toLowerCase().includes(q) ||
      (s.claimed_identity && s.claimed_identity.toLowerCase().includes(q)) ||
      s.threat_type.toLowerCase().includes(q) ||
      s.risk_level.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4" />
            <span>SOC Telemetry & Incident Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Security Operations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time aggregation of analyzed threat vectors, brand impersonation outbreaks,
            and archived forensic incident records.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Ingested</span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {stats.total_scans}
            </span>
            <span className="text-[10px] text-slate-500">All vectors</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Critical Threats</span>
            <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
              {stats.critical_threats}
            </span>
            <span className="text-[10px] text-rose-500/80">Immediate action</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">High Risk</span>
            <span className="text-2xl font-black text-orange-400 font-mono mt-1 block">
              {stats.high_risk_threats}
            </span>
            <span className="text-[10px] text-orange-500/80">Restricted access</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Impersonations</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {stats.impersonation_attempts}
            </span>
            <span className="text-[10px] text-amber-500/80">CyberTrust caught</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Safe Verdicts</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {stats.safe_verdicts}
            </span>
            <span className="text-[10px] text-emerald-500/80">Verified benign</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Risk Score</span>
            <span className="text-2xl font-black text-cyan-300 font-mono mt-1 block">
              {stats.average_risk_score}
            </span>
            <span className="text-[10px] text-slate-500">Out of 100</span>
          </div>
        </div>
      )}

      {/* Scans Table with Search & Filtering */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search targets, brands, classifications..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-slate-200 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            {['ALL', 'CRITICAL', 'HIGH RISK', 'SAFE', 'URL', 'EMAIL', 'MESSAGE'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  filterType === type
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Target Vector</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Claimed Brand</th>
                <th className="py-2.5 px-3">Attack Goal</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No matching scan telemetry records found.
                  </td>
                </tr>
              ) : (
                filteredScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 max-w-xs truncate font-mono text-white">
                      <span className="hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => onSelectScan(scan.id)}>
                        {scan.target}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                            scan.risk_level === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : scan.risk_level === 'HIGH RISK'
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : scan.risk_level === 'SUSPICIOUS'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {scan.risk_score} / 100
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{scan.risk_level}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {scan.claimed_identity ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">{scan.claimed_identity}</span>
                          {scan.impersonation_detected && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold">
                              SPOOFED
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-400">
                      {scan.attack_goal}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectScan(scan.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onOpenReport(scan.id)}
                          className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
