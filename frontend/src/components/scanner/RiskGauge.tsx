import React from 'react';
import type { ThreatLevel } from '../../types';

interface RiskGaugeProps {
  score: number;
  threatLevel: ThreatLevel | string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  threatLevel,
  size = 190,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Score is 0 - 100
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = '#10b981'; // SAFE
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (threatLevel === 'SUSPICIOUS') {
    color = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else if (threatLevel === 'HIGH RISK') {
    color = '#f97316';
    glowColor = 'rgba(249, 115, 22, 0.4)';
  } else if (threatLevel === 'CRITICAL') {
    color = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.5)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(30, 41, 59, 0.8)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Active Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
            filter: `drop-shadow(0 0 10px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center Score & Threat Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-4xl font-extrabold tracking-tight font-mono text-white" style={{ textShadow: `0 0 14px ${glowColor}` }}>
          {Math.round(score)}
          <span className="text-xs font-normal text-slate-400">/100</span>
        </span>
        <span
          className="mt-1 text-xs font-bold tracking-widest uppercase"
          style={{ color }}
        >
          {threatLevel}
        </span>
      </div>
    </div>
  );
};
