import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  Filter,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  RefreshCw,
  Plus,
  Edit3,
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import type { IncidentItem, IncidentStatus } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';

const STATUS_OPTIONS: IncidentStatus[] = ['New', 'Investigating', 'Mitigated', 'Closed'];

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents(statusFilter === 'all' ? undefined : statusFilter);
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const handleStatusChange = async (incidentId: string, nextStatus: IncidentStatus) => {
    setUpdating(true);
    try {
      const updated = await api.updateIncidentStatus(incidentId, nextStatus);
      setIncidents((prev) =>
        prev.map((inc) => (inc.incident_id === incidentId ? { ...inc, status: updated.status } : inc))
      );
      if (selectedIncident && selectedIncident.incident_id === incidentId) {
        setSelectedIncident((prev) => prev ? { ...prev, status: updated.status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedIncident || !newNote.trim()) return;
    setUpdating(true);
    try {
      const updatedNotes = selectedIncident.notes
        ? `${selectedIncident.notes}\n[${new Date().toLocaleTimeString()}]: ${newNote}`
        : `[${new Date().toLocaleTimeString()}]: ${newNote}`;

      const updated = await api.updateIncidentStatus(selectedIncident.incident_id, undefined, updatedNotes);
      setSelectedIncident((prev) => prev ? { ...prev, notes: updated.notes } : null);
      setIncidents((prev) =>
        prev.map((inc) => (inc.incident_id === selectedIncident.incident_id ? { ...inc, notes: updated.notes } : inc))
      );
      setNewNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to append note');
    } finally {
      setUpdating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      inc.incident_id.toLowerCase().includes(q) ||
      inc.target.toLowerCase().includes(q) ||
      inc.scenario_type.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'New':
        return 'bg-red-950/80 text-red-400 border-red-800/80';
      case 'Investigating':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'Mitigated':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80';
      case 'Closed':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            Security Operations Center (SOC)
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Incident Tracking & Response
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-2xl">
            Track and remediate active cyber threats detected by CYBERGUARD. Manage lifecycle transitions
            (New → Investigating → Mitigated → Closed) with evidentiary audit logs.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Incident Feed
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All Incidents ({incidents.length})
          </button>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, target, or title..."
            className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading SOC incident registry...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No incidents found matching the filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className="p-5 hover:bg-slate-800/40 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {inc.incident_id}
                    </span>
                    <ThreatBadge level={inc.threat_level} />
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {inc.scenario_type}
                    </span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getStatusColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {inc.title}
                  </h3>

                  <div className="text-xs text-slate-400 truncate font-mono">
                    Target: {inc.target}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 self-end md:self-auto flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">
                      {new Date(inc.created_at).toLocaleDateString()} {new Date(inc.created_at).toLocaleTimeString()}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      <User className="w-3 h-3 text-cyan-400" />
                      {inc.assigned_to || 'analyst@cyberguard.ai'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Detail Slide-over / Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedIncident(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {selectedIncident.incident_id}
                  </span>
                  <ThreatBadge level={selectedIncident.threat_level} />
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedIncident.scenario_type}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {selectedIncident.title}
                </h2>
                <div className="text-xs text-slate-400 font-mono break-all">
                  Target: {selectedIncident.target}
                </div>
              </div>

              {/* Status Mutation Controls */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Update Lifecycle State
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedIncident.incident_id, st)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selectedIncident.status === st
                          ? `${getStatusColor(st)} font-bold ring-2 ring-cyan-500/30`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Notes & Triage Log */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Analyst Response Log & Notes
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedIncident.notes || 'No triage notes entered yet.'}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append new remediation or containment note..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNote();
                    }}
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={updating || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    Append Note
                  </button>
                </div>
              </div>

              {/* Technical Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800">
                <div>
                  <div className="text-slate-500">Assigned Responder:</div>
                  <div className="text-slate-200 font-mono mt-0.5">{selectedIncident.assigned_to || 'analyst@cyberguard.ai'}</div>
                </div>
                <div>
                  <div className="text-slate-500">First Observed:</div>
                  <div className="text-slate-200 font-mono mt-0.5">{new Date(selectedIncident.created_at).toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default IncidentsPage;
