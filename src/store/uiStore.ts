import { create } from 'zustand';
import { PomodoroState, WeeklyPlan } from '../types';

interface UIState {
  currentTab: 'dashboard' | 'focus' | 'analytics' | 'settings';
  searchQuery: string;
  categoryFilter: string;
  priorityFilter: string;
  statusFilter: string;
  
  // Modals
  isAddTaskModalOpen: boolean;
  selectedTaskIdForAnalysis: string | null;
  
  // Pomodoro
  pomodoro: PomodoroState;
  
  // Weekly Plan Cache
  weeklyPlan: WeeklyPlan | null;
  isWeeklyPlanLoading: boolean;

  // Celebratory overlay state
  showCelebration: boolean;

  // Actions
  setCurrentTab: (tab: 'dashboard' | 'focus' | 'analytics' | 'settings') => void;
  setFilters: (filters: { searchQuery?: string; categoryFilter?: string; priorityFilter?: string; statusFilter?: string }) => void;
  setAddTaskModalOpen: (open: boolean) => void;
  setSelectedTaskIdForAnalysis: (id: string | null) => void;
  setShowCelebration: (show: boolean) => void;
  
  // Pomodoro Control
  setPomodoroState: (updates: Partial<PomodoroState>) => void;
  tickPomodoro: () => void;
  resetPomodoro: () => void;
  
  // Weekly Plan Actions
  setWeeklyPlan: (plan: WeeklyPlan | null) => void;
  setWeeklyPlanLoading: (loading: boolean) => void;
}

const INITIAL_POMODORO: PomodoroState = {
  timeLeft: 25 * 60,
  duration: 25 * 60,
  isRunning: false,
  mode: 'work',
  taskId: null,
};

export const useUIStore = create<UIState>((set, get) => ({
  currentTab: 'dashboard',
  searchQuery: '',
  categoryFilter: 'All',
  priorityFilter: 'All',
  statusFilter: 'All',
  
  isAddTaskModalOpen: false,
  selectedTaskIdForAnalysis: null,
  
  pomodoro: INITIAL_POMODORO,
  
  weeklyPlan: null,
  isWeeklyPlanLoading: false,
  showCelebration: false,

  setCurrentTab: (currentTab) => set({ currentTab }),
  
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  
  setAddTaskModalOpen: (isAddTaskModalOpen) => set({ isAddTaskModalOpen }),
  
  setSelectedTaskIdForAnalysis: (selectedTaskIdForAnalysis) => set({ selectedTaskIdForAnalysis }),

  setShowCelebration: (showCelebration) => set({ showCelebration }),

  setPomodoroState: (updates) => set((state) => ({
    pomodoro: { ...state.pomodoro, ...updates }
  })),

  tickPomodoro: () => set((state) => {
    if (!state.pomodoro.isRunning) return {};
    const newTime = state.pomodoro.timeLeft - 1;
    if (newTime <= 0) {
      // Completed, toggle modes
      const nextMode = state.pomodoro.mode === 'work' ? 'break' : 'work';
      const nextDuration = nextMode === 'work' ? 25 * 60 : 5 * 60;
      return {
        pomodoro: {
          ...state.pomodoro,
          mode: nextMode,
          timeLeft: nextDuration,
          duration: nextDuration,
          isRunning: false // stop to let user trigger next segment
        }
      };
    }
    return {
      pomodoro: { ...state.pomodoro, timeLeft: newTime }
    };
  }),

  resetPomodoro: () => set((state) => ({
    pomodoro: {
      ...INITIAL_POMODORO,
      taskId: state.pomodoro.taskId // preserve associated task
    }
  })),

  setWeeklyPlan: (weeklyPlan) => set({ weeklyPlan }),
  setWeeklyPlanLoading: (isWeeklyPlanLoading) => set({ isWeeklyPlanLoading }),
}));
