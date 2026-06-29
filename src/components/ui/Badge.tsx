import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'cyan' | 'green' | 'amber' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'sm',
  className = '',
  id,
  ...props
}) => {
  const badgeId = id || `badge-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseStyle = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    green: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    red: 'bg-red-500/10 text-red-300 border border-red-500/20 border-pulse',
    gray: 'bg-white/5 text-white/60 border border-white/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      id={badgeId}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
