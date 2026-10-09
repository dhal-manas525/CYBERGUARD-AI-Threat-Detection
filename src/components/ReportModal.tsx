import React, { useState, useEffect } from 'react';
import { X, Printer, Copy, Check, ShieldAlert, Download, FileText } from 'lucide-react';
import { ScanResultPayload } from '../types';

interface ReportModalProps {
  scanId: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ scanId, onClose }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${scanId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setReportData(data.report);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [scanId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (reportData?.markdown_export) {
      navigator.clipboard.writeText(reportData.markdown_export);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              SOC Threat Incident Assessment Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy Markdown"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">Copy MD</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Print Report"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs leading-relaxed font-sans">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              Generating forensic incident report artifact...
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    CYBERGUARD™ FORENSIC ASSESSMENT
                  </div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {reportData.report_id}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Timestamp: {reportData.generated_at}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                    reportData.classification === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    reportData.classification === 'HIGH RISK' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    'bg-slate-800 text-slate-200'
                  }`}>
                    {reportData.classification}
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-300 mt-1">
                    Score: {reportData.incident_evidence.risk_score} / 100
                  </div>
                </div>
              </div>

              {/* Target & CyberTrust Section */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                  1. Incident Target & Identity Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Identifier:</span>
                    <span className="font-mono text-white font-bold break-all">
                      {reportData.incident_evidence.target}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Claimed Entity / Brand:</span>
                    <span className="font-bold text-cyan-400">
                      {reportData.incident_evidence.claimed_identity || 'No Recognized Brand Claimed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Impersonation Status:</span>
                    <span className="font-bold text-rose-400">
                      {reportData.incident_evidence.impersonation_detected ? 'CONFIRMED POTENTIAL IMPERSONATION' : 'No Impersonation Detected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                  2. Executive Summary & Assessment
                </h4>
                <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  {reportData.executive_summary}
                </p>
              </div>

              {/* Forensic Evidence Signals */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                  3. Forensic Signal Attribution
                </h4>
                <div className="space-y-1.5">
                  {reportData.incident_evidence.signals.map((sig: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-white">{sig.indicator}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">{sig.explanation}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                        {sig.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                  4. Recommended Security Countermeasures
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {reportData.recommended_actions.map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-2">
                CYBERGUARD™ Risk Assessment Platform • Non-authoritative heuristic & AI evidence synthesis.
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-rose-400">
              Failed to load report artifact.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
