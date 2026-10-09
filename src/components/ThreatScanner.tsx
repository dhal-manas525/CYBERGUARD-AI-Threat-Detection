import React, { useState } from 'react';
import {
  Globe, Mail, MessageSquare, Shield, AlertTriangle, Play,
  CheckCircle2, Sparkles, RefreshCw, Terminal, ArrowRight,
  ShieldAlert, Lock, Zap, Box, Activity
} from 'lucide-react';
import { ScanResultPayload } from '../types';
import { CyberShield3D } from './CyberShield3D';
import { ScanProgressTimeline } from './ScanProgressTimeline';

interface ThreatScannerProps {
  onScanComplete: (result: ScanResultPayload) => void;
}

export const ThreatScanner: React.FC<ThreatScannerProps> = ({ onScanComplete }) => {
  const [scanType, setScanType] = useState<'URL' | 'EMAIL' | 'MESSAGE' | 'WEBSITE'>('URL');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [scanStage, setScanStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [show3DGlobe, setShow3DGlobe] = useState(true);

  // Input states
  const [urlInput, setUrlInput] = useState<string>('https://sbi-secure-login-example.com/verify');
  const [emailSender, setEmailSender] = useState<string>('security-alert@paypal-update-center.org');
  const [emailSubject, setEmailSubject] = useState<string>('CRITICAL: Your PayPal Account will be suspended within 30 minutes');
  const [emailBody, setEmailBody] = useState<string>(
    'Dear Customer, We detected unauthorized login attempts from a new IP. Your account will be permanently blocked in 30 minutes unless you verify your identity immediately. Click here to confirm your password and 6-digit OTP code: http://paypal-verify-alert.net/auth'
  );
  const [messageText, setMessageText] = useState<string>(
    'Amazon HR Team: Congratulations! You have been selected for a remote video optimization role. Earn $300-$800/day part-time. Contact our hiring manager on Telegram: @amazon_recruiter_hr'
  );
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://sbi-secure-login-example.com/verify');

  // Synthetic Hackathon Demos
  const DEMO_CASES = [
    {
      id: 'demo-sbi-impersonation',
      tag: 'SYNTHETIC DEMO 1',
      title: 'State Bank of India Impersonation',
      type: 'URL' as const,
      preview: 'sbi-secure-login-example.com/verify',
      badge: 'CRITICAL / IMPERSONATION',
      load: () => {
        setScanType('URL');
        setUrlInput('https://sbi-secure-login-example.com/verify');
      }
    },
    {
      id: 'demo-safe-paypal',
      tag: 'SYNTHETIC DEMO 2',
      title: 'Official PayPal Sign-in Portal',
      type: 'URL' as const,
      preview: 'paypal.com/signin',
      badge: 'SAFE / VERIFIED BRAND',
      load: () => {
        setScanType('URL');
        setUrlInput('https://www.paypal.com/signin');
      }
    },
    {
      id: 'demo-ip-phishing',
      tag: 'SYNTHETIC DEMO 3',
      title: 'Raw IP Credential Harvester',
      type: 'URL' as const,
      preview: '192.168.1.50/paypal/login.php',
      badge: 'CRITICAL / IP HOST',
      load: () => {
        setScanType('URL');
        setUrlInput('http://192.168.1.50/paypal/login.php?update=account');
      }
    },
    {
      id: 'demo-job-scam',
      tag: 'SYNTHETIC DEMO 4',
      title: 'Fake Job / Telegram Advance Scam',
      type: 'MESSAGE' as const,
      preview: 'Earn $300-$800/day remote Amazon task',
      badge: 'HIGH RISK / TASK FRAUD',
      load: () => {
        setScanType('MESSAGE');
        setMessageText(
          'Amazon HR Team: Congratulations! You have been selected for a remote video optimization role. Earn $300-$800/day part-time. Contact our hiring manager on Telegram: @amazon_recruiter_hr'
        );
      }
    },
    {
      id: 'demo-urgent-email',
      tag: 'SYNTHETIC DEMO 5',
      title: 'Urgent Bank Suspension Email (OTP Hook)',
      type: 'EMAIL' as const,
      preview: 'Account blocked in 30 mins, verify OTP',
      badge: 'CRITICAL / SOCIAL ENGINEERING',
      load: () => {
        setScanType('EMAIL');
        setEmailSender('security-alert@sbi-yono-kyc-update.com');
        setEmailSubject('FINAL NOTICE: SBI Account Locked within 30 Minutes');
        setEmailBody(
          'Dear Customer, Your SBI YONO banking access has been restricted due to expired KYC records. To prevent complete account seizure, verify your NetBanking password and OTP immediately at: https://onlinesbi-kyc-portal.net/login'
        );
      }
    }
  ];

  const handleExecuteScan = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    setCurrentStepIndex(0); // Phase 1: Preprocessing

    // Smooth timeline step advance timers
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 450); // Phase 2: Feature Extraction
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 950); // Phase 3: CyberTrust Intelligence Analysis
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 1450); // Phase 4: Risk Scoring

    const stages = [
      'Phase 1: Preprocessing & RFC 3986 Token Normalization...',
      'Phase 2: Extracting 24 structural, lexical & host features...',
      'Phase 3: Running CyberTrust Intelligence™ identity analysis...',
      'Phase 4: Running ML Gradient-Boosted Forest inference & Risk Scoring...',
      'Finalizing explainable AI forensic report...'
    ];

    let currentStageIndex = 0;
    setScanStage(stages[0]);
    const stageInterval = setInterval(() => {
      currentStageIndex = (currentStageIndex + 1) % stages.length;
      setScanStage(stages[currentStageIndex]);
    }, 450);

    try {
      let endpoint = '/api/analyze/url';
      let payload: any = {};

      if (scanType === 'URL') {
        endpoint = '/api/analyze/url';
        payload = { url: urlInput };
      } else if (scanType === 'EMAIL') {
        endpoint = '/api/analyze/email';
        payload = { sender: emailSender, subject: emailSubject, body: emailBody };
      } else if (scanType === 'MESSAGE') {
        endpoint = '/api/analyze/message';
        payload = { text: messageText };
      } else if (scanType === 'WEBSITE') {
        endpoint = '/api/analyze/website';
        payload = { url: websiteUrl };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(stageInterval);

      // Flash completion step
      setCurrentStepIndex(4);

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(data);
      }, 450);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(stageInterval);
      setIsScanning(false);
      setErrorMsg(err.message || 'Scan execution failed. Please verify input.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Headline with 3D Cyber-Core Grid */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline & Core Philosophy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>CyberTrust Intelligence™ Active</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-[11px] font-mono">
                <Activity className="h-3 w-3 text-indigo-400" />
                <span>3D MATRIX ACTIVE</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              "Don't just detect the threat. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">
                Understand who is behind it.
              </span>"
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              CYBERGUARD goes beyond generic phishing checkers. Our hybrid engine fuses statistical ML,
              deep lexical heuristics, and <strong className="text-cyan-300">CyberTrust Intelligence™</strong> to uncover
              deceptive brand impersonation, spoofed identity claims, and attack motives in real time.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Features</span>
                <span className="text-white font-bold">24 Vector Signals</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">ML Accuracy</span>
                <span className="text-emerald-400 font-bold">94.1% F1-Score</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Network Defense</span>
                <span className="text-cyan-400 font-bold">SSRF Protected</span>
              </div>
            </div>
          </div>

          {/* Right: 3D Holographic Threat Globe & Particle Shield */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <CyberShield3D
              status={isScanning ? 'SCANNING' : 'IDLE'}
              interactive={true}
              compact={false}
            />
          </div>
        </div>

        {/* Synthetic Demo Presets Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              1-Click Synthetic Hackathon Scenarios:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Select to auto-populate input</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {DEMO_CASES.map(demo => (
              <button
                key={demo.id}
                onClick={demo.load}
                className="group text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                  <span className="text-cyan-400">{demo.tag}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                    demo.badge.includes('SAFE') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    demo.badge.includes('CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {demo.badge.split('/')[0].trim()}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1 truncate group-hover:text-cyan-300 transition-colors">
                  {demo.title}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                  {demo.preview}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Scanner Studio */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur">
        {/* Scanner Vector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5 overflow-x-auto">
          {[
            { id: 'URL', label: 'Suspicious URL Scanner', icon: Globe },
            { id: 'EMAIL', label: 'Phishing Email Analyzer', icon: Mail },
            { id: 'MESSAGE', label: 'Scam / SMS / Chat Scanner', icon: MessageSquare },
            { id: 'WEBSITE', label: 'Safe Website Inspector (SSRF-Protected)', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const active = scanType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScanType(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Input Forms Based on Active Tab */}
        <div className="space-y-4">
          {scanType === 'URL' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target URL for Deep Feature & Impersonation Analysis:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/login"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-slate-200 font-mono placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Extracts 24 lexical features, Shannon entropy, brand similarities, and cross-references verified enterprise registries.
              </p>
            </div>
          )}

          {scanType === 'EMAIL' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sender Email Address:
                  </label>
                  <input
                    type="text"
                    value={emailSender}
                    onChange={e => setEmailSender(e.target.value)}
                    placeholder="e.g. security-alert@paypal-update.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="e.g. Action Required: Account Verification"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Body Content & Links:
                </label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Paste the full email text here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 font-mono outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Detects sender/domain spoofing, fear triggers, OTP harvesting language, and extracts embedded URLs for CyberTrust verification.
              </p>
            </div>
          )}

          {scanType === 'MESSAGE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                SMS, WhatsApp, Telegram, or Social Media Message Text:
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Paste suspicious text message or SMS..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 font-mono outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Detects task/job scams, urgent banking OTP requests, lottery/crypto fraud, and social engineering manipulation.
              </p>
            </div>
          )}

          {scanType === 'WEBSITE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Website URL (Protected by SSRF Shield):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Shield className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-slate-200 font-mono outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Safely probes remote HTTP headers, TLS status, and redirect chains. Strict SSRF protection blocks any loopback, private VPC, or metadata IPs.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Execution Button & Progress */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>All analyses run through strict deterministic rules + explainable AI grounding.</span>
            </div>

            <button
              onClick={handleExecuteScan}
              disabled={isScanning}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40 ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white hover:shadow-cyan-500/25'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Analyzing Vector...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Execute CyberGuard Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Animated Scanning Banner */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-800/40 space-y-2 mt-4 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                  <Terminal className="h-3.5 w-3.5" />
                  {scanStage}
                </span>
                <span className="text-slate-400 font-bold">LIVE STAGE {currentStepIndex + 1}/4</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 h-full w-full animate-indeterminate rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Real-Time Progress Timeline */}
      <ScanProgressTimeline
        currentStepIndex={currentStepIndex}
        isScanning={isScanning}
      />
    </div>
  );
};
