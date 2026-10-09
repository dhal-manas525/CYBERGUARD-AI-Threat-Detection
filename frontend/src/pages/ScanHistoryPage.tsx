import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  Eye,
  FileText,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import type { ScanListItem, ScanResponse } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { Modal } from '../components/common/Modal';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';

export const ScanHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scanType, setScanType] = useState('ALL');
  const [threatLevel, setThreatLevel] = useState('ALL');
  const [sortField, setSortField] = useState<'created_at' | 'risk_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [inspectScan, setInspectScan] = useState<ScanResponse | null>(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans({
        scan_type: scanType !== 'ALL' ? scanType.toLowerCase() : undefined,
        threat_level: threatLevel !== 'ALL' ? threatLevel.toUpperCase() : undefined,
        search: search.trim() || undefined,
      });
      setScans(data);
    } catch (e) {
      console.error('Error fetching scans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [scanType, threatLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScans();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this scan from records?')) return;
    try {
      await api.deleteScan(id);
      setScans(scans.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to delete record');
    }
  };

  const handleInspect = async (id: number) => {
    try {
      const data = await api.getScanDetails(id);
      setInspectScan(data);
    } catch (e: any) {
      alert('Unable to load scan details');
    }
  };

  // Sort
  const sortedScans = [...scans].sort((a, b) => {
    if (sortField === 'risk_score') {
      return sortOrder === 'desc' ? b.risk_score - a.risk_score : a.risk_score - b.risk_score;
    }
    return sortOrder === 'desc'
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <History className="w-4 h-4" />
            <span>AUDIT & TELEMETRY ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Incident & Scan History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete database of verified URLs, messages, and email investigations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchScans}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search target URL, claimed brand, or classification..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Vector Types</option>
            <option value="URL">URL Scans</option>
            <option value="EMAIL">Email Scans</option>
            <option value="MESSAGE">Message Scans</option>
            <option value="WEBSITE">Website Scans</option>
          </select>

          <select
            value={threatLevel}
            onChange={(e) => setThreatLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH RISK">High Risk</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="SAFE">Safe</option>
          </select>

          <button
            type="button"
            onClick={() => {
              if (sortField === 'risk_score') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortField('risk_score');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-slate-300 hover:border-cyan-400"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sort Score {sortField === 'risk_score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
          </button>
        </div>
      </div>

      {/* Scans Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Vector</th>
                <th className="py-3 px-4">Claimed Entity</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Scanned On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedScans.length > 0 ? (
                sortedScans.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/50 transition">
                    <td className="py-3.5 px-4 text-slate-500 font-mono">#{item.id}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-semibold max-w-sm truncate" title={item.target}>
                      {item.target}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 uppercase">{item.scan_type}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.claimed_identity || 'Unidentified'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {Math.round(item.risk_score)}/100
                    </td>
                    <td className="py-3.5 px-4">
                      <ThreatBadge level={item.threat_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleInspect(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 transition text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    {loading ? 'Retrieving records...' : 'No incident logs found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      <Modal
        isOpen={Boolean(inspectScan)}
        onClose={() => setInspectScan(null)}
        title={`Scan Inspection Archive — #${inspectScan?.id}`}
        maxWidth="4xl"
      >
        {inspectScan && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 block mb-1">Target Resource:</span>
              <span className="text-cyan-400 break-all font-semibold">{inspectScan.target}</span>
            </div>
            <CyberTrustPanel
              cybertrust={inspectScan.cybertrust}
              threatLevel={inspectScan.threat_level}
              riskScore={inspectScan.risk_score}
              mlPrediction={inspectScan.ml_prediction}
              mlConfidence={inspectScan.ml_confidence}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
