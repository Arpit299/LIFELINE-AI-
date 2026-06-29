export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO String
  priority: 'low' | 'medium' | 'high';
  category: string;
  impact: number; // 1 to 5
  dependencies: string[]; // List of task IDs this task is blocked by
  status: 'todo' | 'doing' | 'done';
  completedAt: string | null;
  createdAt: string;
  userId: string;
  urgencyScore: number; // Calculated dynamic Lifeline Score (0-100)
  aiAnalysis?: TaskAIAnalysis | null;
}

export interface TaskAIAnalysis {
  urgency_score: number;
  reasoning: string;
  blockers: string[];
  next_action: string;
  analyzedAt: string;
}

export interface UserStats {
  streak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  totalTasks: number;
  history: { date: string; completedCount: number }[];
}

export interface WeeklyDayBlock {
  day: string;
  timeBlocks: {
    time: string;
    taskTitle: string;
    duration: string;
    notes?: string;
  }[];
}

export interface WeeklyPlan {
  planMarkdown: string;
  generatedAt: string;
}

export interface PomodoroState {
  timeLeft: number;
  duration: number;
  isRunning: boolean;
  mode: 'work' | 'break';
  taskId: string | null;
}

export interface FocusCoachResponse {
  subtasks: { title: string; durationMinutes: number }[];
  coachingMessage: string;
}
