import React from 'react';
import { motion } from 'motion/react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { formatDeadlineRemaining, isOverdue } from '../../lib/dateUtils';
import { getScoreColor } from '../../lib/urgencyScore';
import { 
  CheckCircle2, 
  Trash2, 
  BrainCircuit, 
  Calendar, 
  ShieldAlert, 
  Clock,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { toggleTaskStatus, deleteTask, tasks } = useTaskStore();
  const { setSelectedTaskIdForAnalysis, setPomodoroState, setCurrentTab, setShowCelebration } = useUIStore();

  const scoreColor = getScoreColor(task.urgencyScore);
  const overdue = isOverdue(task.deadline);

  // Find if task is blocked by any unfinished dependencies
  const unfinishedDeps = task.dependencies.map(depId => tasks.find(t => t.id === depId))
    .filter(depTask => depTask && depTask.status !== 'done') as Task[];

  const isBlocked = unfinishedDeps.length > 0;

  const handleToggleStatus = async () => {
    // Fire confetti on complete!
    if (task.status !== 'done') {
      const activePending = tasks.filter(t => t.status !== 'done');
      if (activePending.length === 1 && activePending[0].id === task.id) {
        // Trigger full page celebration
        setShowCelebration(true);
      } else {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8B5CF6', '#06B6D4', '#10B981']
        });
      }
    }
    await toggleTaskStatus(task.id);
  };

  const handleStartTimer = () => {
    setPomodoroState({ taskId: task.id, isRunning: true });
    setCurrentTab('focus');
  };

  // SVG Circular Ring calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (task.urgencyScore / 100) * circumference;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <Card className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative pl-7 overflow-hidden" hoverEffect>
        {/* Left colored priority indicator bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          task.priority === 'high' 
            ? 'bg-red' 
            : task.priority === 'medium' 
            ? 'bg-amber' 
            : 'bg-green'
        }`} />

        <div className="flex items-start gap-4 flex-1">
          {/* Checkbox */}
          <button
            onClick={handleToggleStatus}
            className={`mt-1 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ${
              task.status === 'done' 
                ? 'text-emerald-400 hover:text-emerald-300' 
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            <CheckCircle2 className={`w-6 h-6 ${task.status === 'done' ? 'fill-emerald-500/10' : ''}`} />
          </button>

          {/* Core Info */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`text-base font-semibold text-white/90 truncate leading-snug ${task.status === 'done' ? 'line-through text-white/40' : ''}`}>
                {task.title}
              </h4>
              <Badge variant="gray">{task.category}</Badge>
              {isBlocked && (
                <Tooltip content={`Blocked by: ${unfinishedDeps.map(d => d.title).join(', ')}`}>
                  <Badge variant="red" size="sm" className="gap-1 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    Blocked
                  </Badge>
                </Tooltip>
              )}
            </div>

            <p className={`text-sm text-white/60 line-clamp-2 ${task.status === 'done' ? 'text-white/30' : ''}`}>
              {task.description || 'No description provided.'}
            </p>

            {/* Meta badges row */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}
              </span>

              <span className={`flex items-center gap-1.5 font-medium ${overdue && task.status !== 'done' ? 'text-red-400' : 'text-white/50'}`}>
                <Clock className="w-3.5 h-3.5" />
                {formatDeadlineRemaining(task.deadline)}
              </span>

              <span className="flex items-center gap-1 font-mono text-[11px]">
                Impact:
                <span className="flex gap-0.5 ml-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx < task.impact 
                          ? 'bg-violet' 
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Scoring & Actions Side Panel */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
          {/* Animated score ring */}
          {task.status !== 'done' && (
            <Tooltip content="Dynamic Lifeline Score calculated from deadline intensity and cascading blocks.">
              <div className="flex items-center gap-2 cursor-help">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                    {/* Background Ring */}
                    <circle
                      cx="28"
                      cy="28"
                      r={radius}
                      className="text-white/5 fill-transparent"
                      strokeWidth="4"
                      stroke="currentColor"
                    />
                    {/* Foreground Ring */}
                    <motion.circle
                      cx="28"
                      cy="28"
                      r={radius}
                      className={`${scoreColor.text} fill-transparent`}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xs font-mono font-bold text-white/80">
                    {task.urgencyScore}
                  </span>
                </div>
              </div>
            </Tooltip>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {task.status !== 'done' && (
              <>
                <button
                  onClick={handleStartTimer}
                  title="Focus mode with timer"
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-cyan-400/20" />
                </button>
                <button
                  onClick={() => setSelectedTaskIdForAnalysis(task.id)}
                  title="Trigger Gemini Urgency Analyzer"
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              title="Delete task"
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
export default TaskCard;
