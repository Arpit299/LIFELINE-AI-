import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import Card from '../ui/Card';
import { motion } from 'motion/react';
import { CheckCircle2, ListTodo, Award, AlertCircle, Zap } from 'lucide-react';

export const DashboardSummary: React.FC = () => {
  const { tasks } = useTaskStore();

  // Get current date boundaries
  const todayStr = new Date().toDateString();

  // Filter and compute stats
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'done' || !t.completedAt) return false;
    try {
      return new Date(t.completedAt).toDateString() === todayStr;
    } catch {
      return false;
    }
  });

  const completedTodayCount = completedToday.length;
  const remainingCount = tasks.filter((t) => t.status !== 'done').length;
  const totalActiveAndToday = completedTodayCount + remainingCount;
  
  const completionRate = totalActiveAndToday > 0 
    ? Math.round((completedTodayCount / totalActiveAndToday) * 100) 
    : 0;

  // Find highest urgency remaining task
  const topPriorityTask = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => b.urgencyScore - a.urgencyScore)[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Card 1: Completed Today */}
      <Card className="relative overflow-hidden p-5 border border-emerald-500/10 bg-emerald-950/5 hover:border-emerald-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-lg pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-4xs uppercase tracking-widest text-emerald-400 font-bold font-mono flex items-center gap-1">
              <Award className="w-3 h-3" /> Velocity Check
            </span>
            <span className="text-2xs text-white/40 font-medium">Completed Today</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">{completedTodayCount}</span>
              <span className="text-2xs text-emerald-400/80 font-mono font-medium">nodes cleared</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/15">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          {completedTodayCount > 0 ? (
            <div className="text-4xs font-mono text-emerald-400/70 truncate">
              Last: "{completedToday[completedToday.length - 1].title}"
            </div>
          ) : (
            <div className="text-4xs font-mono text-white/20">
              No tasks completed today yet. Let's make progress!
            </div>
          )}
        </div>
      </Card>

      {/* Card 2: Remaining Tasks */}
      <Card className="relative overflow-hidden p-5 border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full filter blur-lg pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-4xs uppercase tracking-widest text-cyan-400 font-bold font-mono flex items-center gap-1">
              <Zap className="w-3 h-3" /> Active Backlog
            </span>
            <span className="text-2xs text-white/40 font-medium">Remaining Tasks</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">{remainingCount}</span>
              <span className="text-2xs text-cyan-400/80 font-mono font-medium">pending operations</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/15">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          {topPriorityTask ? (
            <div className="text-4xs font-mono text-cyan-400/70 flex items-center gap-1 truncate">
              <AlertCircle className="w-3 h-3 text-cyan-400 shrink-0" />
              Top Urgency: "{topPriorityTask.title}" ({Math.round(topPriorityTask.urgencyScore)} pts)
            </div>
          ) : (
            <div className="text-4xs font-mono text-white/20">
              Clear backlog! No active tasks remaining.
            </div>
          )}
        </div>
      </Card>

      {/* Card 3: Performance Ratio */}
      <Card className="relative overflow-hidden p-5 border border-purple-500/10 bg-purple-950/5 hover:border-purple-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full filter blur-lg pointer-events-none" />
        <div className="flex flex-col h-full justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-4xs uppercase tracking-widest text-purple-400 font-bold font-mono">
                Efficiency Index
              </span>
              <span className="text-2xs text-white/40 font-medium">Completion Ratio</span>
            </div>
            <div className="text-xl font-black text-purple-400 font-mono">
              {completionRate}%
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full mt-1">
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-4xs font-mono text-white/30">
              <span>0%</span>
              <span>
                {completedTodayCount} of {totalActiveAndToday} tasks
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardSummary;
