import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  color?: 'purple' | 'cyan' | 'green' | 'amber' | 'red';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'purple',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    purple: 'bg-purple-500 shadow-purple-500/20',
    cyan: 'bg-cyan-500 shadow-cyan-500/20',
    green: 'bg-emerald-500 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    red: 'bg-red-500 shadow-red-500/20',
  };

  return (
    <div className={`w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 shadow ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
export default ProgressBar;
