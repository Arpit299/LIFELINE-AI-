import React, { useState } from 'react';
import FocusMode from '../components/features/FocusMode';
import WeeklyPlanView from '../components/features/WeeklyPlanView';
import { Target, CalendarDays } from 'lucide-react';

export const FocusPage: React.FC = () => {
  const [focusSubTab, setFocusSubTab] = useState<'coach' | 'weekly'>('coach');

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16 lg:pb-6">
      {/* Tab bar header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-bold text-white/95">Tactical Control</h2>
          <p className="text-xs text-white/40 mt-0.5">Isolate critical targets and map optimal time-blocked structures.</p>
        </div>

        {/* Focus Sub-Tab switcher */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button
            onClick={() => setFocusSubTab('coach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-all cursor-pointer ${
              focusSubTab === 'coach' 
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/25' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Atomic Coach
          </button>
          <button
            onClick={() => setFocusSubTab('weekly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold rounded-lg transition-all cursor-pointer ${
              focusSubTab === 'weekly' 
                ? 'bg-cyan-600/20 text-cyan-200 border border-cyan-500/25' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Weekly Strategy
          </button>
        </div>
      </div>

      {/* View Injection */}
      {focusSubTab === 'coach' ? (
        <FocusMode />
      ) : (
        <WeeklyPlanView />
      )}
    </div>
  );
};
export default FocusPage;
