import { Task } from '../types';

/**
 * Calculates the proprietary Lifeline Score™ for a task
 * 
 * score = (urgency_weight × time_pressure) + (impact × blocking_factor)
 * time_pressure = 1 - (hours_remaining / total_hours)
 * blocking_factor = 1 + (0.25 × blocked_tasks_count)
 */
export const calculateUrgencyScore = (task: Task, allTasks: Task[]): number => {
  if (task.status === 'done') {
    return 0; // Completed tasks carry zero urgency pressure
  }

  const now = Date.now();
  const deadlineTime = new Date(task.deadline).getTime();
  const hoursRemaining = (deadlineTime - now) / (1000 * 60 * 60);

  // Time pressure limits: 168 hours (7 days) as standard planning window
  const totalHours = 168; 
  let timePressure = 0;

  if (hoursRemaining <= 0) {
    timePressure = 1.0; // Overdue tasks have maximum time pressure
  } else {
    // Scales from 1 (due now) to 0 (due in 7+ days)
    timePressure = Math.max(0, 1 - (hoursRemaining / totalHours));
  }

  // Count how many tasks list THIS task's ID as a dependency
  const blockedTasksCount = allTasks.filter(
    (t) => t.status !== 'done' && t.dependencies && t.dependencies.includes(task.id)
  ).length;

  const blockingFactor = 1 + (0.25 * blockedTasksCount);

  // Weights configuration
  const urgencyWeight = 60; // Up to 60 points from pure time pressure
  const baseImpactWeight = 6; // Impact of 1-5 maps to 6-30 points

  const rawScore = (urgencyWeight * timePressure) + ((task.impact * baseImpactWeight) * blockingFactor);

  // Clip the score to ensure standard 0-100 bounds
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return finalScore;
};

export const getScoreColor = (score: number): { text: string; bg: string; border: string; glow: string } => {
  if (score <= 40) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10'
    };
  } else if (score <= 70) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10'
    };
  } else {
    return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/20 animate-pulse'
    };
  }
};
