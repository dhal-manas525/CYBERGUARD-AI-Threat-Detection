import React, { useState } from 'react';
import { Terminal, Send, Check, Copy, Code2, Globe, Shield, RefreshCw } from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('url');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({ url: 'https://sbi-secure-login-example.com/verify' }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ENDPOINTS = [
    {
      id: 'url',
      method: 'POST',
      path: '/api/analyze/url',
      desc: 'Deep feature extraction, CyberTrust brand verification, ML inference, and explainable risk score calculation for a candidate URL.',
      defaultBody: JSON.stringify({ url: 'https://sbi-secure-login-example.com/verify' }, null, 2)
    },
    {
      id: 'email',
      method: 'POST',
      path: '/api/analyze/email',
      desc: 'NLP analysis for sender domain mismatch, psychological urgency, fear tactics, and embedded URL threats in emails.',
      defaultBody: JSON.stringify({
        sender: 'security-alert@paypal-update-center.org',
        subject: 'URGENT: Your account will be locked in 30 minutes',
        body: 'Click here to re-verify your password and OTP: http://paypal-verify-alert.net/auth'
      }, null, 2)
    },
    {
      id: 'message',
      method: 'POST',
      path: '/api/analyze/message',
      desc: 'Scam & SMS classifier detecting Telegram job tasks, OTP harvesting, fake lottery prizes, and rogue tech support numbers.',
      defaultBody: JSON.stringify({
        text: 'Amazon HR: You have been selected for remote task work! Earn $500/day. Contact HR on Telegram @amazon_recruiter_hr'
      }, null, 2)
    },
    {
      id: 'website',
      method: 'POST',
      path: '/api/analyze/website',
      desc: 'Safe remote HTTP probe protected by SSRF guard (blocks loopback, 10.0.0.0/8, and cloud metadata 169.254.169.254).',
      defaultBody: JSON.stringify({ url: 'https://sbi-secure-login-example.com/verify' }, null, 2)
    },
    {
      id: 'health',
      method: 'GET',
      path: '/api/health',
      desc: 'Engine health check status including CyberTrust, ML Forest, and Gemini Explainer readiness.',
      defaultBody: ''
    },
    {
      id: 'metrics',
      method: 'GET',
      path: '/api/ml/metrics',
      desc: 'Returns validation metrics, confusion matrix, ROC-AUC, and feature importances for the ML model.',
      defaultBody: ''
    }
  ];

  const handleSelectEndpoint = (ep: typeof ENDPOINTS[0]) => {
    setSelectedEndpoint(ep.id);
    setRequestBody(ep.defaultBody);
    setResponseOutput(null);
  };

  const handleExecuteRequest = async () => {
    const ep = ENDPOINTS.find(e => e.id === selectedEndpoint);
    if (!ep) return;

    setIsLoading(true);
    try {
      const options: RequestInit = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (ep.method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(ep.path, options);
      const data = await res.json();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message || 'Request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseOutput) {
      navigator.clipboard.writeText(responseOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentEp = ENDPOINTS.find(e => e.id === selectedEndpoint)!;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Terminal className="h-4 w-4" />
            <span>Developer Integration & REST API Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            CyberGuard Programmatic API Endpoints
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integrate CyberGuard threat assessment into your SIEM, email security gateways, and proxy firewalls.
            All endpoints support JSON payloads and respond with structured forensic signals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Endpoints List */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            API Endpoints Catalog
          </h3>
          {ENDPOINTS.map(ep => {
            const isSelected = selectedEndpoint === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ep.method === 'POST' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono font-semibold text-slate-200 truncate">
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {ep.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Request & Response Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    currentEp.method === 'POST' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {currentEp.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {currentEp.path}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Body Editor */}
            {currentEp.method !== 'GET' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Request Payload (JSON):
                </label>
                <textarea
                  rows={5}
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Live Response Viewer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-400">
                  Live Response Output (HTTP 200 / JSON):
                </label>
                {responseOutput && (
                  <button
                    onClick={handleCopyResponse}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy Response'}</span>
                  </button>
                )}
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed scrollbar-thin">
                {responseOutput || '// Click "Send Request" to test endpoint live...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
