import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('analyst@cyberguard.ai');
  const [password, setPassword] = useState('CyberGuard@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-neon-cyan">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-neon-cyan mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight">
            SOC Analyst Access
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Authenticate to the CyberTrust Intelligence™ Command Grid
          </p>
        </div>

        {/* Demo credentials notification */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-mono space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-cyan-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pre-Configured Demo Credentials:</span>
          </div>
          <div>User: <span className="text-white select-all">analyst@cyberguard.ai</span></div>
          <div>Pass: <span className="text-white select-all">CyberGuard@2026!</span></div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@cyberguard.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer font-mono">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0" />
              <span>Remember grid token</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('In demo mode, please use the pre-configured credentials: analyst@cyberguard.ai / CyberGuard@2026!'); }} className="text-cyan-400 hover:underline font-mono">
              Forgot pass?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition shadow-neon-cyan"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to SOC'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 font-mono">
          Don't have an analyst profile?{' '}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
