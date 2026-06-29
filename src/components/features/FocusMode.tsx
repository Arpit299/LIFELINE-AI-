import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { generateFocusCoaching } from '../../lib/gemini/client';
import { FocusCoachResponse, Task } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import PomodoroTimer from './PomodoroTimer';
import { 
  Sparkles, 
  Target, 
  CheckSquare, 
  Square, 
  Trophy, 
  Flame,
  BrainCircuit,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export const FocusMode: React.FC = () => {
  const { tasks, toggleTaskStatus, demoMode } = useTaskStore();
  const { pomodoro, setPomodoroState, setShowCelebration } = useUIStore();

  const [coaching, setCoaching] = useState<FocusCoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSubtasks, setCompletedSubtasks] = useState<number[]>([]);

  // Find highest urgency active task (excluding completed tasks)
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const topTask = activeTasks.length > 0 
    ? [...activeTasks].sort((a, b) => b.urgencyScore - a.urgencyScore)[0] 
    : null;

  // Set active task id in Pomodoro state automatically
  useEffect(() => {
    if (topTask && pomodoro.taskId !== topTask.id) {
      setPomodoroState({ taskId: topTask.id });
    }
  }, [topTask?.id]);

  const handleEnlistCoach = async () => {
    if (!topTask) return;
    setLoading(true);
    setError(null);
    setCoaching(null);
    setCompletedSubtasks([]);

    try {
      const response = await generateFocusCoaching(topTask, demoMode);
      setCoaching(response);
    } catch (e: any) {
      setError(e.message || 'The coach is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubtask = (index: number) => {
    setCompletedSubtasks(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleTaskComplete = async () => {
    if (topTask) {
      const activePending = tasks.filter(t => t.status !== 'done');
      if (activePending.length === 1 && activePending[0].id === topTask.id) {
        setShowCelebration(true);
      }
      await toggleTaskStatus(topTask.id);
      setCoaching(null);
      setCompletedSubtasks([]);
    }
  };

  if (!topTask) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
        <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-white/95">Master Backlog Cleared!</h3>
        <p className="text-sm text-white/50 mt-2 leading-relaxed">
          You have zero active tasks requiring priority. This is the ultimate peak of productivity. Go recharge, write a retrospective, or enjoy some breathing space!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Pomodoro and Core Focus card */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <PomodoroTimer />
        
        {/* Isolated Task Focus Board */}
        <Card className="p-5 flex flex-col gap-4 border-l-4 border-l-purple-500">
          <span className="text-3xs uppercase font-bold tracking-widest text-purple-400 font-mono flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 animate-pulse" />
            Top Urgent Priority Right Now
          </span>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-white/90 leading-tight">
              {topTask.title}
            </h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="purple">{topTask.category}</Badge>
              <Badge variant="red">Urgency Score: {topTask.urgencyScore}</Badge>
            </div>
          </div>

          <p className="text-xs text-white/60 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5">
            {topTask.description || 'No detailed scope supplied.'}
          </p>

          <Button variant="glass" size="sm" onClick={handleTaskComplete} className="w-full text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
            Complete and File Away
          </Button>
        </Card>
      </div>

      {/* Right Column: AI Focus Coach Area */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card className="p-6 flex flex-col gap-5 min-h-80 justify-center">
          {!coaching && !loading ? (
            <div className="flex flex-col items-center text-center p-6 gap-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-semibold text-white/90">Facing Procrastination?</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Enlist the Gemini Focus Coach to break down this high-pressure milestone into atomic, easily digestible sub-tasks and receive high-performance energy coaching.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={handleEnlistCoach} className="w-full max-w-xs mt-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Activate AI Focus Coach
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-purple-300">Summoning Coach...</span>
                <span className="text-3xs text-white/30 font-mono uppercase">Analyzing inertia vectors</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-6 flex flex-col gap-3">
              <p className="text-sm text-red-300 font-semibold">{error}</p>
              <Button variant="glass" size="sm" onClick={handleEnlistCoach} className="mx-auto">
                Retry Connection
              </Button>
            </div>
          ) : coaching ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Coach Quote Bubble */}
              <div className="relative p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-white/90 leading-relaxed">
                <div className="flex items-center gap-1.5 mb-2 border-b border-purple-500/10 pb-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-2xs font-bold uppercase tracking-wider text-purple-300 font-mono">Focus Directive</span>
                </div>
                <p className="text-xs italic leading-relaxed text-purple-200">
                  "{coaching.coachingMessage}"
                </p>
              </div>

              {/* Checklist */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider font-mono">
                  Atomic Breakdown Checklist
                </span>
                <div className="flex flex-col gap-2">
                  {coaching.subtasks.map((sub, idx) => {
                    const isDone = completedSubtasks.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleSubtask(idx)}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 justify-between transition-all text-left cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300/80' 
                            : 'bg-white/[0.02] border-white/5 text-white/80 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-white/20 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${isDone ? 'line-through opacity-50' : ''}`}>
                            {sub.title}
                          </span>
                        </div>
                        <Badge variant={isDone ? 'green' : 'cyan'} size="sm">
                          {sub.durationMinutes}m
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress metrics */}
              <div className="flex items-center justify-between text-2xs text-white/40 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1 font-mono uppercase">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {completedSubtasks.length} of {coaching.subtasks.length} completed
                </span>
                {completedSubtasks.length === coaching.subtasks.length && (
                  <span className="text-emerald-400 font-semibold font-mono animate-bounce">
                    Checklist Complete! Complete the core card!
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
export default FocusMode;
