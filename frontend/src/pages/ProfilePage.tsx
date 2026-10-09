import React, { useState, useEffect } from 'react';
import { User, Shield, KeyRound, LogOut, Activity, Calendar, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as UserType } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cyberguard_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cyberguard_token');
    localStorage.removeItem('cyberguard_user');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <User className="w-4 h-4" />
          <span>SECURITY OPERATOR DOSSIER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Analyst Profile & Credentials
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Authenticated credentials and telemetry permissions.
        </p>
      </div>

      {user ? (
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-2xl font-bold font-mono shadow-neon-cyan">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">{user.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="uppercase">{user.role}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-850 border border-rose-500/30 text-rose-300 hover:bg-rose-950/50 text-xs font-mono transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminate Session</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Operator ID</span>
                <span className="text-white font-bold">#OP-{user.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Clearance Level</span>
                <span className="text-cyan-400 font-bold">SOC Level 3 (Lead Triage)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Provisioned Date</span>
                <span className="text-slate-300">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center font-mono text-sm text-slate-400">
          No active session detected.{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-cyan-400 underline font-semibold ml-1"
          >
            Authenticate here
          </button>
        </div>
      )}
    </div>
  );
};
