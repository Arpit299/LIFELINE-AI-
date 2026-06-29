import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = '',
  id,
  ...props
}) => {
  const cardId = id || `card-${Math.random().toString(36).substring(2, 9)}`;
  const hoverClass = hoverEffect 
    ? 'hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-0.5' 
    : '';

  return (
    <div
      id={cardId}
      className={`bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-xl ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
