import React from 'react';
import { Shield, Lock, Cpu, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-cyan-500/15 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-base font-bold text-white font-mono tracking-wider">
                CYBER<span className="text-cyan-400">GUARD</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              "Don't just detect the threat. Understand who is behind it."
            </p>
            <div className="text-[11px] font-mono text-cyan-400/80">
              CYBERTRUST INTELLIGENCE™ ENGINE
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">
              Detection Engines
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/scan/url" className="hover:text-cyan-400 transition">
                  URL Threat Scanner
                </Link>
              </li>
              <li>
                <Link to="/scan/email" className="hover:text-cyan-400 transition">
                  Email Phishing Analyzer
                </Link>
              </li>
              <li>
                <Link to="/scan/message" className="hover:text-cyan-400 transition">
                  SMS & WhatsApp Scam Detector
                </Link>
              </li>
              <li>
                <Link to="/scan/website" className="hover:text-cyan-400 transition">
                  Safe Website Inspector
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">
              SOC Command
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition">
                  Security Operations Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-cyan-400 transition">
                  Incident History & Audit
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-cyan-400 transition">
                  Threat Intelligence Reports
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cyan-400 transition">
                  Heuristic & ML Config
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & AI */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 font-mono">
              Intelligence Stack
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multinomial ML Classifier</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Homoglyph & Brand Matching</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explainable AI Attribution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Essential Disclaimers as required by Section 30 */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-start gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Security Notice:</strong> CYBERGUARD provides automated threat risk assessment based on available signals, lexical indicators, and brand heuristics. It does not replace an antivirus or guarantee absolute safety. Always verify critical workflows through secondary authorized channels.
            </p>
          </div>
          <div className="font-mono text-slate-400 shrink-0">
            CYBERGUARD AI © 2026. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
