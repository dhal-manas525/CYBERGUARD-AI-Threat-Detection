import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  ArrowRight,
  Cpu,
  Lock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Terminal,
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { CyberSecurityCore } from '../components/3d/CyberSecurityCore';
import { DEMO_SAMPLES } from '../services/demoData';
import { validateUrlInput } from '../utils/validators';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('http://onlinesbi-kyc-verification-portal.com/login.php');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickInput.trim();
    const validation = validateUrlInput(clean);
    if (!validation.isValid) {
      setInputError(validation.error || 'Please enter a valid URL or domain to analyze.');
      return;
    }
    setInputError(null);
    navigate(`/scan/url?target=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Glow Orbs Backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/20 blur-[130px] rounded-full" />

      {/* 1. HERO SECTION WITH 3D CORE */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CYBERTRUST INTELLIGENCE™ NEXT-GEN SOC ENGINE
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Don't Just Detect the Threat.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Understand Who Is Behind It.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              CYBERGUARD uses AI, threat intelligence, and explainable security analysis to detect phishing, scams, malicious URLs, and digital impersonation.
            </p>

            {/* Interactive Hero Quick Input */}
            <form onSubmit={handleQuickAnalyze} className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-neon-cyan focus-within:border-cyan-400 transition-all">
                <Search className="w-5 h-5 text-cyan-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Enter suspicious URL to inspect (e.g. sbi-kyc-login.xyz)..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow-neon-cyan shrink-0 transition"
                >
                  <span>Scan Threat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {inputError && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}

              {/* Demo Mode Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Try Demo:</span>
                {DEMO_SAMPLES.slice(0, 3).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      if (sample.payload.url) setQuickInput(sample.payload.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 text-[11px] font-mono transition"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/scan/url"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold text-sm tracking-wide font-mono hover:bg-cyan-300 shadow-neon-cyan transition"
              >
                <Zap className="w-4 h-4" />
                <span>Launch Full Scanner</span>
              </Link>
              <a
                href="#cybertrust"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-sm font-medium font-mono transition"
              >
                <span>Explore CyberTrust Intelligence</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Right Column: 3D CYBERSECURITY CORE */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[440px] rounded-3xl border border-cyan-500/20 bg-slate-950/60 p-4 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Three.js canvas */}
              <CyberSecurityCore threatLevel="IDLE" className="w-full h-full" />

              {/* Overlay Hologram Telemetry HUD */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-cyan-400/90 bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>CORE: ONLINE</span>
                </div>
                <div>PARALLAX SENSOR: ACTIVE</div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
                <span>NETWORK → ANALYSIS → DEFENSE</span>
                <span className="text-cyan-400 font-bold">60 FPS REALTIME</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE THREAT DETECTION DEMO */}
      <section className="py-16 bg-slate-950/60 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
              Autonomous Verification Sandbox
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Watch CYBERGUARD Deconstruct a Phishing Threat
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Unlike legacy blockers that output opaque percentages, CYBERGUARD exposes the underlying intent and counterfeit branding.
            </p>
          </div>

          {/* Side-by-side comparison card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Legacy Approach */}
            <div className="rounded-2xl border border-rose-900/30 bg-slate-950/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-rose-950">
                  <span className="text-xs font-mono text-slate-400 uppercase">Legacy URL Checker</span>
                  <span className="text-xs font-mono text-rose-400">Opaque Detection</span>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="text-xs text-slate-400 font-mono">Target: http://sbi-kyc-portal.xyz</div>
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-center">
                    <div className="text-4xl font-extrabold font-mono text-rose-400">95%</div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-300 mt-1">Phishing Detected</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/50 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Explanation:</span> Blocked by statistical filter. No attribution or actionable breakdown provided.
                  </div>
                </div>
              </div>
              <div className="mt-6 text-[11px] text-slate-500 font-mono">
                Leaves user unaware of who is being impersonated or what attacker wanted.
              </div>
            </div>

            {/* CYBERGUARD CyberTrust Approach */}
            <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950/40 p-6 shadow-neon-cyan flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    CYBERGUARD CYBERTRUST™
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Explainable Intelligence</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Target Host:</span>
                    <span className="text-cyan-300 font-mono font-medium">onlinesbi-kyc-verification.com</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Claimed Brand:</span>
                      <span className="text-xs font-bold text-white">State Bank of India (SBI)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Identity Status:</span>
                      <span className="text-xs font-bold text-rose-400">CRITICAL MISMATCH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Assessed Goal:</span>
                      <span className="text-xs font-semibold text-amber-300">Internet Banking & OTP Theft</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Authorized domain is <strong>onlinesbi.sbi</strong>, not .com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Coercive KYC verification language detected in URI path</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-mono">Transparent Evidence</span>
                <Link to="/scan/url" className="text-xs font-bold text-white hover:text-cyan-300 flex items-center gap-1">
                  Run Live Scan <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE CYBERTRUST INTELLIGENCE™ SECTION */}
      <section id="cybertrust" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-300 mb-3">
            <Lock className="w-3 h-3 text-purple-400" />
            CORE DIFFERENTIATOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The CyberTrust Intelligence™ Matrix
          </h2>
          <p className="text-base text-slate-300 mt-3">
            CYBERGUARD answers the question traditional scanners ignore: <br className="hidden sm:inline" />
            <span className="text-cyan-400 font-semibold italic">"Why should I trust this?"</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-cyan-500/30 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 shadow-neon-cyan">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Claimed Identity Attribution</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Determines who the target is pretending to be. Watches over 40+ premier banks, tech enterprises, and government services.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
              Detects: SBI, Microsoft, Google, PayPal, Amazon, IRS, USPS, DHL
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-purple-500/30 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 shadow-neon-purple">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Typosquatting & Homoglyphs</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Applies Levenshtein distance, token analysis, and homoglyph normalizers to detect deceptive looks-alikes (e.g. micr0s0ft, sbi-portal).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
              Detects: Lookalike naming, hyphenation traps, subdomain fraud
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-emerald-500/30 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Actionable Defense Mitigations</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rather than causing panic, the system generates prioritized defensive workflows: quarantine, official URL redirects, and SOC reporting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
              Guides: Credential quarantine, incident containment, official links
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-slate-950/70 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
              Autonomous Pipeline Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-white">How CYBERGUARD Analyzes Every Vector</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Lexical & Structural Extraction',
                desc: 'Computes 21 mathematical features including entropy, subdomains, unusual TLDs, and path obfuscation.',
              },
              {
                step: '02',
                title: 'ML Classification',
                desc: 'Softmax Multinomial Classifier outputs probabilistic confidence across Safe, Suspicious, and Malicious.',
              },
              {
                step: '03',
                title: 'Brand Impersonation Engine',
                desc: 'Cross-verifies apparent organization signatures against official domain registries and homoglyph dictionaries.',
              },
              {
                step: '04',
                title: 'CyberTrust Synthesis',
                desc: 'Generates transparent evidence checklists, specific adversary goals, and downloadable compliance reports.',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 relative">
                <span className="text-3xl font-extrabold font-mono text-cyan-500/30 absolute top-4 right-4">
                  {s.step}
                </span>
                <h4 className="text-base font-bold text-white mb-2 mt-4">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SUPPORTED THREAT TYPES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
            Multi-Vector Protection
          </h2>
          <h3 className="text-3xl font-extrabold text-white">Supported Threat Vectors</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/scan/url"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition hover:-translate-y-1"
          >
            <Search className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h4 className="text-base font-bold text-white mb-1">URL Threat Scanner</h4>
            <p className="text-xs text-slate-400">
              Inspects phishing URLs, disposable TLDs, direct IP rogue hosts, and login credential harvesters.
            </p>
          </Link>

          <Link
            to="/scan/email"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/40 transition hover:-translate-y-1"
          >
            <Layers className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition" />
            <h4 className="text-base font-bold text-white mb-1">Email Phishing Analyzer</h4>
            <p className="text-xs text-slate-400">
              Dissects urgent language manipulation, sender-domain mismatch, and embedded credential lures.
            </p>
          </Link>

          <Link
            to="/scan/message"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/40 transition hover:-translate-y-1"
          >
            <ShieldAlert className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition" />
            <h4 className="text-base font-bold text-white mb-1">SMS & WhatsApp Scams</h4>
            <p className="text-xs text-slate-400">
              Identifies electricity disconnection scams, fake jobs, crypto Ponzi schemes, and OTP social engineering.
            </p>
          </Link>

          <Link
            to="/scan/website"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition hover:-translate-y-1"
          >
            <Lock className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition" />
            <h4 className="text-base font-bold text-white mb-1">Safe Website Inspector</h4>
            <p className="text-xs text-slate-400">
              Performs non-intrusive domain and protocol inspection protected by strict SSRF guardrails.
            </p>
          </Link>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-purple-950/50 p-10 sm:p-16 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Verify Your Digital Assets?
          </h2>
          <p className="text-base text-slate-300 mt-4 max-w-2xl mx-auto">
            Experience CyberTrust Intelligence™ in action. Run instantaneous scans with zero configuration or access complete historical telemetry.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/scan/url"
              className="px-8 py-3.5 rounded-xl bg-cyan-400 text-black font-bold text-sm font-mono uppercase tracking-wide hover:bg-cyan-300 shadow-neon-cyan transition"
            >
              Analyze URL Now
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-white font-medium text-sm font-mono transition"
            >
              Open SOC Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
