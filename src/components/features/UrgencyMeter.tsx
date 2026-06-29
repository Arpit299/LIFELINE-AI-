import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import Card from '../ui/Card';
import Tooltip from '../ui/Tooltip';
import { ShieldAlert, Flame, CheckCircle, Hourglass } from 'lucide-react';
import { motion } from 'motion/react';

export const UrgencyMeter: React.FC = () => {
  const { tasks } = useTaskStore();
  
  const activeTasks = tasks.filter(t => t.status !== 'done');
  
  // Overall Workload Pressure = average score of active tasks, or 0 if none
  const pressureScore = activeTasks.length > 0 
    ? Math.round(activeTasks.reduce((acc, t) => acc + t.urgencyScore, 0) / activeTasks.length) 
    : 0;

  const criticalCount = activeTasks.filter(t => t.urgencyScore > 70).length;
  const warningsCount = activeTasks.filter(t => t.urgencyScore > 40 && t.urgencyScore <= 70).length;
  const stableCount = activeTasks.filter(t => t.urgencyScore <= 40).length;

  // Compute exact metrics based on real task state
  const now = Date.now();
  const dueWithinTwoHours = activeTasks.filter(t => {
    if (!t.deadline) return false;
    const dueTime = new Date(t.deadline).getTime();
    const diff = dueTime - now;
    return diff > 0 && diff < 2 * 60 * 60 * 1000;
  }).length;

  const blockedCount = activeTasks.filter(t => t.dependencies && t.dependencies.length > 0).length;

  let pressureState = { 
    label: 'STABLE ATMOSPHERE', 
    colorClass: 'text-green', 
    stroke: '#10B981', 
    intensity: 'Low' 
  };
  if (pressureScore > 70) {
    pressureState = { 
      label: 'CRITICAL PRESSURE', 
      colorClass: 'text-red', 
      stroke: '#EF4444', 
      intensity: 'High' 
    };
  } else if (pressureScore > 40) {
    pressureState = { 
      label: 'ELEVATED TENSION', 
      colorClass: 'text-amber', 
      stroke: '#F59E0B', 
      intensity: 'Moderate' 
    };
  }

  // Circular ring variables (Radius 70, Circumference ~440)
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const strokeDashoffset = circumference - (pressureScore / 100) * circumference;

  return (
    <Card className="p-6 flex flex-col items-center text-center justify-between min-h-[440px]">
      <div className="text-sm font-semibold text-white/50 uppercase tracking-widest mt-1 mb-4">
        Current Lifeline Score
      </div>

      {/* Progress Ring Gauge */}
      <div className="w-[180px] h-[180px] relative flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="8"
          />
          <motion.circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill="none"
            stroke={pressureState.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-mono text-[64px] font-bold leading-none ${pressureState.colorClass}`}>
            {pressureScore}
          </span>
        </div>
      </div>

      {/* Score Label Description */}
      <div className="font-mono text-2xs text-white/50 uppercase tracking-[2px] mt-4 mb-4">
        {pressureState.label}
      </div>

      {/* Score Drivers list */}
      <div className="w-full text-left border-t border-glass-border pt-4 mb-4">
        <div className="text-3xs uppercase tracking-widest text-white/40 font-bold mb-3 font-mono">
          Score Drivers
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs flex justify-between items-center text-white/75">
            <span>Time Pressure</span>
            <span className={`font-semibold ${pressureScore > 70 ? 'text-red' : pressureScore > 40 ? 'text-amber' : 'text-green'}`}>
              {pressureState.intensity}
            </span>
          </div>
          <div className="text-xs flex justify-between items-center text-white/75">
            <span>Blocking Factors</span>
            <span className={`font-semibold ${blockedCount > 0 ? 'text-amber' : 'text-white/40'}`}>
              {blockedCount} {blockedCount === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Boxes Grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Tooltip content="Active tasks with deadlines arriving within the next 2 hours.">
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-glass-border text-left">
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Due &lt; 2h</div>
            <div className="font-mono text-xl font-bold mt-1 text-white">
              {String(dueWithinTwoHours).padStart(2, '0')}
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Active backlog tasks currently blocked by unfinished prerequisite tasks.">
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-glass-border text-left">
            <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Blocked</div>
            <div className="font-mono text-xl font-bold mt-1 text-white">
              {String(blockedCount).padStart(2, '0')}
            </div>
          </div>
        </Tooltip>
      </div>
    </Card>
  );
};
export default UrgencyMeter;
