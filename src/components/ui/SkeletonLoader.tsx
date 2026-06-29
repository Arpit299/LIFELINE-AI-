import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-white/5 rounded-xl h-16 w-full border border-white/5 ${className}`}
          style={{ animationDelay: `${idx * 150}ms` }}
        />
      ))}
    </div>
  );
};

export const AIAnalysisSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full p-5 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-8 bg-white/10 rounded-full w-12" />
      </div>
      <div className="h-3 bg-white/10 rounded w-full" />
      <div className="h-3 bg-white/10 rounded w-5/6" />
      <div className="h-3 bg-white/10 rounded w-4/5" />
      
      <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-3">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>

      <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-8 bg-white/10 rounded-xl w-full" />
      </div>
    </div>
  );
};
