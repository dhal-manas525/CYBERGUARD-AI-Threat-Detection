import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Shield, CheckCircle2, AlertTriangle, Building2, Lock, Search } from 'lucide-react';
import { api } from '../services/api';
import type { ScanListItem, ReportResponse } from '../types';
import { ThreatBadge } from '../components/common/ThreatBadge';

export const ReportsPage: React.FC = () => {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await api.getScans({ limit: 15 } as any);
        setScans(data);
        if (data.length > 0) {
          setSelectedScanId(data[0].id);
          generateReport(data[0].id);
        }
      } catch (e) {
        console.error('Failed to load scans for reports', e);
      }
    };
    fetchRecent();
  }, []);

  const generateReport = async (scanId: number) => {
    setLoading(true);
    setSelectedScanId(scanId);
    try {
      const data = await api.generateReport(scanId);
      setReport(data);
    } catch (e) {
      console.error('Error generating report', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'json' | 'csv') => {
    if (!selectedScanId) return;
    try {
      const blob = await api.exportReport(selectedScanId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberguard-report-${selectedScanId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            <span>EXECUTIVE INTELLIGENCE & COMPLIANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Threat Intelligence Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exportable audit briefs, brand spoofing evidence, and incident triage summaries.
          </p>
        </div>

        {report && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleDownload('json')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition"
              title="Export structured JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload('csv')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition"
              title="Export CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs font-mono uppercase tracking-wide hover:bg-cyan-300 shadow-neon-cyan transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scan Selector */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            Select Inspected Target
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {scans.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => generateReport(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 text-xs font-mono ${
                  selectedScanId === s.id
                    ? 'border-cyan-500/50 bg-cyan-950/40 text-white shadow-neon-cyan'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">#{s.id} · {s.scan_type.toUpperCase()}</span>
                  <ThreatBadge level={s.threat_level} size="sm" showIcon={false} />
                </div>
                <div className="truncate text-slate-300 font-medium">{s.target}</div>
                <div className="text-[10px] text-slate-500">
                  {new Date(s.created_at).toLocaleDateString()} · Risk: {Math.round(s.risk_score)}/100
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: The Formal Printable Security Report Document */}
        <div className="lg:col-span-8">
          {report ? (
            <div
              id="printable-report"
              className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl space-y-6 text-slate-200 font-sans print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
            >
              {/* Report Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-mono tracking-wider text-white print:text-black">
                      CYBER<span className="text-cyan-400">GUARD</span>
                    </h2>
                    <div className="text-[10px] font-mono text-slate-400">
                      CYBERTRUST INTELLIGENCE™ ADVISORY
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-cyan-400 font-bold">{report.report_id}</div>
                  <div className="text-slate-400 text-[11px]">
                    {new Date(report.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Target & Verdict Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                  <div className="text-xs text-slate-400 uppercase font-mono">Target Resource</div>
                  <div className="text-sm font-bold font-mono text-cyan-300 print:text-blue-700 break-all mt-1">
                    {report.scan_data.target}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                  <div className="text-xs text-slate-400 uppercase font-mono">Composite Risk Score</div>
                  <div className="text-2xl font-extrabold font-mono text-white print:text-black mt-1">
                    {report.scan_data.risk_score}
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <ThreatBadge level={report.scan_data.threat_level} size="sm" />
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                  <div className="text-xs text-slate-400 uppercase font-mono">Threat Classification</div>
                  <div className="text-sm font-semibold text-white print:text-black mt-1">
                    {report.scan_data.threat_category}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 print:text-blue-600 mb-2 font-bold">
                  Executive Briefing
                </h4>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-sm leading-relaxed text-slate-300 print:text-slate-800">
                  {report.executive_summary}
                </div>
              </div>

              {/* Identity & Attribution Analysis */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 print:text-blue-600 mb-2 font-bold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Attribution & Identity Analysis</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block">Claimed Identity:</span>
                    <span className="text-white font-bold text-sm">
                      {report.scan_data.cybertrust.claimed_identity}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block">Identity Match Status:</span>
                    <span className="text-white font-bold text-sm">
                      {report.scan_data.cybertrust.identity_match_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Flagged Evidence */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 print:text-blue-600 mb-2 font-bold">
                  Detected Threat Indicators & Telemetry
                </h4>
                <ul className="space-y-2">
                  {report.scan_data.cybertrust.why_flagged.map((ev, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/70"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigation Steps */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 print:text-blue-600 mb-2 font-bold">
                  Recommended Mitigation Protocol
                </h4>
                <ul className="space-y-2 text-xs">
                  {report.mitigation_steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Stamp */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SYSTEM: {report.generator_system}</span>
                <span>SIGNATURE: VERIFIED CRYPTOGRAPHIC VERDICT</span>
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-500 font-mono text-xs">
              {loading ? 'Synthesizing report...' : 'Select a scan to inspect its report.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
