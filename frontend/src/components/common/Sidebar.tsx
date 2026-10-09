import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Mail,
  MessageSquare,
  Globe,
  Fingerprint,
  Activity,
  History,
  FileText,
  User,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { label: 'SOC Command', path: '/dashboard', icon: LayoutDashboard },
    { label: 'URL Threat Scanner', path: '/scan/url', icon: Search, badge: 'CORE' },
    { label: 'Digital Impersonation', path: '/scan/impersonation', icon: Fingerprint, badge: 'SCENARIO B' },
    { label: 'Auth Anomaly Detector', path: '/scan/auth-anomaly', icon: Activity, badge: 'SCENARIO C' },
    { label: 'Incident Response', path: '/incidents', icon: ShieldAlert, badge: 'SOC' },
    { label: 'AI Cyber Advisor', path: '/assistant', icon: Bot, badge: 'GEMINI' },
    { label: 'Email Phishing', path: '/scan/email', icon: Mail },
    { label: 'Message & Scam', path: '/scan/message', icon: MessageSquare },
    { label: 'Website Inspector', path: '/scan/website', icon: Globe },
    { label: 'Scan History', path: '/history', icon: History },
    { label: 'Threat Reports', path: '/reports', icon: FileText },
    { label: 'Analyst Profile', path: '/profile', icon: User },
    { label: 'SOC Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-cyan-500/15 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-6 z-50 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:text-white shadow-neon-cyan transition"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 group ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold ml-1 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* CyberTrust Sentinel Status Footer */}
      {!collapsed ? (
        <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CYBERTRUST™ v2.5</span>
          </div>
          <p className="text-slate-500 text-[10px]">
            Explainable AI threat engine active. Attribution & homoglyph matching online.
          </p>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" title="Grid Active" />
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
