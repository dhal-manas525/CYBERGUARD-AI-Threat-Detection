/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ThreatScanner } from './components/ThreatScanner';
import { ScanResultView } from './components/ScanResultView';
import { CyberTrustExplorer } from './components/CyberTrustExplorer';
import { MLStudio } from './components/MLStudio';
import { DashboardView } from './components/DashboardView';
import { ApiDocsView } from './components/ApiDocsView';
import { CyberAssistantView } from './components/CyberAssistantView';
import { FloatingAssistantDrawer } from './components/FloatingAssistantDrawer';
import { ReportModal } from './components/ReportModal';
import { ScanResultPayload } from './types';
import { Shield, Sparkles, Lock, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [currentScanResult, setCurrentScanResult] = useState<ScanResultPayload | null>(null);
  const [reportModalScanId, setReportModalScanId] = useState<string | null>(null);

  const handleScanComplete = (result: ScanResultPayload) => {
    setCurrentScanResult(result);
  };

  const handleResetScan = () => {
    setCurrentScanResult(null);
  };

  const handleSelectPastScan = async (scanId: string) => {
    try {
      const res = await fetch(`/api/scans/${scanId}`);
      if (res.ok) {
        const data = await res.json();
        const scan = data.scan;
        // Transform to result payload format
        setCurrentScanResult({
          scan_id: scan.id,
          target: scan.target,
          risk_score: scan.risk_score,
          risk_level: scan.risk_level,
          threat_type: scan.threat_type,
          model_confidence: scan.risk_result?.model_confidence || 92,
          score_breakdown: scan.risk_result?.score_breakdown,
          cybertrust: scan.cybertrust,
          ml_result: scan.ml_result,
          signals: scan.risk_result?.signals || [],
          features: scan.features,
          attack_goal: scan.attack_goal,
          explanation: scan.explanation,
          recommendations: scan.risk_result?.recommendations || [],
          limitations: scan.risk_result?.limitations || [],
          created_at: scan.created_at
        });
        setActiveTab('scanner');
      }
    } catch (err) {
      console.error('Failed to load past scan:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewScanClick={() => {
          setCurrentScanResult(null);
          setActiveTab('scanner');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: THREAT SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            {!currentScanResult ? (
              <ThreatScanner onScanComplete={handleScanComplete} />
            ) : (
              <ScanResultView
                result={currentScanResult}
                onOpenReportModal={() => setReportModalScanId(currentScanResult.scan_id)}
                onResetScan={handleResetScan}
                onOpenAssistant={() => setActiveTab('assistant')}
              />
            )}
          </div>
        )}

        {/* TAB 2: CYBERGUARD AI ASSISTANT */}
        {activeTab === 'assistant' && (
          <CyberAssistantView
            scanContext={currentScanResult}
            onNavigateToScan={() => setActiveTab('scanner')}
          />
        )}

        {/* TAB 3: CYBERTRUST BRAND KNOWLEDGE BASE */}
        {activeTab === 'brands' && <CyberTrustExplorer />}

        {/* TAB 4: MACHINE LEARNING & FEATURE STUDIO */}
        {activeTab === 'ml' && <MLStudio />}

        {/* TAB 5: SOC DASHBOARD & INCIDENT REPORTS */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectScan={handleSelectPastScan}
            onOpenReport={scanId => setReportModalScanId(scanId)}
          />
        )}

        {/* TAB 6: API & PYTHON EXPORT */}
        {activeTab === 'api' && <ApiDocsView />}
      </main>

      {/* Floating AI Defense Assistant Drawer */}
      <FloatingAssistantDrawer
        scanContext={currentScanResult}
        onNavigateToScan={() => setActiveTab('scanner')}
      />

      {/* Incident Report Modal */}
      {reportModalScanId && (
        <ReportModal
          scanId={reportModalScanId}
          onClose={() => setReportModalScanId(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">CYBERGUARD™</span>
            <span>— AI-Powered Cyber Threat & Digital Impersonation Detection</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" /> CyberTrust Intelligence™
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3 text-indigo-400" /> Explainable AI Layer
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" /> SSRF Network Shield
            </span>
          </div>

          <div className="text-[11px] text-slate-400 text-center md:text-right">
            Risk Assessment System. Never assumes absolute certainty.
          </div>
        </div>
      </footer>
    </div>
  );
}
