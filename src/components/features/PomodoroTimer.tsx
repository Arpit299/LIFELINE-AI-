import React, { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { formatTimeLeftForTimer } from '../../lib/dateUtils';
import Card from '../ui/Card';
import { Play, Pause, RotateCcw, Flame, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

export const PomodoroTimer: React.FC = () => {
  const { pomodoro, setPomodoroState, tickPomodoro, resetPomodoro } = useUIStore();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (pomodoro.isRunning) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isRunning]);

  const handleToggle = () => {
    setPomodoroState({ isRunning: !pomodoro.isRunning });
  };

  // Percent calculation for remaining time
  const fractionRemaining = pomodoro.timeLeft / pomodoro.duration;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - fractionRemaining * circumference;

  return (
    <Card className="p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Visual background indicator depending on mode */}
      <div className={`absolute inset-0 bg-gradient-to-b opacity-5 pointer-events-none ${
        pomodoro.mode === 'work' ? 'from-purple-500/30' : 'from-cyan-500/30'
      }`} />

      <div className="flex flex-col gap-4 items-center">
        {/* Mode badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          pomodoro.mode === 'work' 
            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
        }`}>
          {pomodoro.mode === 'work' ? (
            <>
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>Sprint Focus Block</span>
            </>
          ) : (
            <>
              <Coffee className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rest & Recovery</span>
            </>
          )}
        </div>

        {/* Circular Clock SVG */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-white/5 fill-transparent"
              strokeWidth="4"
              stroke="currentColor"
            />
            {/* Countdown Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className={`fill-transparent ${
                pomodoro.mode === 'work' ? 'text-purple-500' : 'text-cyan-500'
              }`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              transition={{ ease: 'linear', duration: 1 }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-black text-white/95 tracking-tight">
              {formatTimeLeftForTimer(pomodoro.timeLeft)}
            </span>
            <span className="text-3xs uppercase font-bold text-white/30 tracking-widest mt-0.5">
              Time Left
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetPomodoro}
            title="Reset Session"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 border border-white/5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggle}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm shadow-xl transition-all cursor-pointer ${
              pomodoro.isRunning 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/10' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
            }`}
          >
            {pomodoro.isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Focus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
export default PomodoroTimer;
