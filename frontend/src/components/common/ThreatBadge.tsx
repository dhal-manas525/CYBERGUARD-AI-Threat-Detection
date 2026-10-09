import React from 'react';
import type { ThreatLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface ThreatBadgeProps {
  level: ThreatLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const norm = level.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let IconComponent = ShieldCheck;

  if (norm === 'SAFE') {
    colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
    IconComponent = ShieldCheck;
  } else if (norm === 'SUSPICIOUS') {
    colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    IconComponent = AlertTriangle;
  } else if (norm === 'HIGH RISK') {
    colorClasses = 'bg-orange-950/70 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]';
    IconComponent = AlertOctagon;
  } else if (norm === 'CRITICAL') {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-[0_0_16px_rgba(239,68,68,0.3)] animate-pulse';
    IconComponent = ShieldAlert;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold tracking-wider',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md uppercase ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={iconSizes} />}
      <span>{norm}</span>
    </span>
  );
};
