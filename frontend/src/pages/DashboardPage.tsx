import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  AlertOctagon,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import type { DashboardStats, ScanListItem, ScanResponse } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Modal } from '../components/common/Modal';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterThreat, setFilterThreat] = useState('ALL');
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewScan = async (scanId: number) => {
    setIsDetailLoading(true);
    try {
      const details = await api.getScanDetails(scanId);
      setSelectedScanDetail(details);
    } catch (e) {
      console.error('Failed to fetch scan detail', e);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filteredScans = (stats?.recent_scans || []).filter((scan) => {
    const matchesSearch =
      scan.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.threat_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.claimed_identity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || scan.scan_type.toUpperCase() === filterType;
    const matchesThreat = filterThreat === 'ALL' || scan.threat_level.toUpperCase() === filterThreat;
    return matchesSearch && matchesType && matchesThreat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SECURITY OPERATIONS CENTER (SOC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Global Cyber Threat Command
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated telemetry, impersonation metrics, and real-time risk trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-mono transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Feed</span>
          </button>
          <Link
            to="/scan/url"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs font-mono uppercase tracking-wide hover:bg-cyan-300 shadow-neon-cyan transition"
          >
            <span>Scan Threat</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STATS TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scans */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Inspections</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-4">
            {stats?.total_scans ?? '--'}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">All Vectors Monitored</div>
        </div>

        {/* Threats Detected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Threats Detected</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-4">
            {stats?.threats_detected ?? '--'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Score &gt; 30 Threshold</div>
        </div>

        {/* Critical Threats */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Critical Threats</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 mt-4">
            {stats?.critical_threats ?? '--'}
          </div>
          <div className="text-[11px] text-rose-300 font-mono mt-1">Active Phish / Spoofs</div>
        </div>

        {/* Average Risk Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Avg Risk Index</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-300 mt-4">
            {stats?.average_risk_score ? `${stats.average_risk_score}` : '--'}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className="text-[11px] text-purple-400 font-mono mt-1">Weighted Composite</div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Distribution Donut */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Threat Distribution</span>
            <span className="text-xs text-slate-500 font-normal">By Severity</span>
          </h3>
          <div className="h-60 w-full flex items-center justify-center">
            {stats?.threat_distribution && stats.threat_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.threat_distribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.threat_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-mono">Loading telemetry...</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            {stats?.threat_distribution?.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}:</span>
                <span className="text-white font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Categories Bar Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Threat Vectors & Classification Breakdown</span>
            <span className="text-xs text-slate-500 font-normal">Top Categories</span>
          </h3>
          <div className="h-60 w-full">
            {stats?.category_breakdown && stats.category_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.category_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                Loading telemetry...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SCANS TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Recent Incident Ingest & Scans
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of verified targets and attribution verdicts.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search target or brand..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="URL">URL</option>
              <option value="EMAIL">Email</option>
              <option value="MESSAGE">Message</option>
              <option value="WEBSITE">Website</option>
            </select>

            {/* Threat Level Filter */}
            <select
              value={filterThreat}
              onChange={(e) => setFilterThreat(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH RISK">High Risk</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Target Resource</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Claimed Identity</th>
                <th className="py-3 px-3">Risk Index</th>
                <th className="py-3 px-3">Verdict</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-3 font-medium text-slate-200 max-w-xs truncate" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 uppercase">
                      {scan.scan_type}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {scan.claimed_identity || 'Unidentified'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">
                      {Math.round(scan.risk_score)}/100
                    </td>
                    <td className="py-3.5 px-3">
                      <ThreatBadge level={scan.threat_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewScan(scan.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-300 transition text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No scans matching the current search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedScanDetail)}
        onClose={() => setSelectedScanDetail(null)}
        title={`Incident Breakdown — #${selectedScanDetail?.id}`}
        maxWidth="4xl"
      >
        {selectedScanDetail && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Target:</div>
              <div className="text-cyan-400 break-all font-semibold">{selectedScanDetail.target}</div>
            </div>
            <CyberTrustPanel
              cybertrust={selectedScanDetail.cybertrust}
              threatLevel={selectedScanDetail.threat_level}
              riskScore={selectedScanDetail.risk_score}
              mlPrediction={selectedScanDetail.ml_prediction}
              mlConfidence={selectedScanDetail.ml_confidence}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
