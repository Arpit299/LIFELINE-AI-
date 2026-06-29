import { create } from 'zustand';
import { Task, UserStats, TaskAIAnalysis } from '../types';
import { calculateUrgencyScore } from '../lib/urgencyScore';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  query,
  where
} from 'firebase/firestore';

interface TaskState {
  tasks: Task[];
  stats: UserStats;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  isSyncing: boolean;
  
  // Actions
  setDemoMode: (enabled: boolean) => void;
  loadLocalTasks: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'urgencyScore' | 'status' | 'completedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  updateTaskAIAnalysis: (id: string, analysis: TaskAIAnalysis) => Promise<void>;
  recalculateScores: () => void;
  resetStore: () => void;
  syncWithFirestore: (userId: string) => () => void;
}

const DEFAULT_STATS: UserStats = {
  streak: 0,
  lastCompletedDate: null,
  totalCompleted: 0,
  totalTasks: 0,
  history: [],
};

// Seed initial tasks for demo mode or first-time users
const DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Prepare Vibe2Ship Presentation Slides',
    description: 'Structure slides highlighting the Lifeline AI urgency engine and architectural flow. Focus on technical metrics.',
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    priority: 'high',
    category: 'Work',
    impact: 5,
    dependencies: [],
    status: 'doing',
    completedAt: null,
    createdAt: new Date().toISOString(),
    userId: 'demo-user',
    urgencyScore: 88,
    aiAnalysis: {
      urgency_score: 88,
      reasoning: 'Extremely high priority because the hackathon presentation is critical for demo success and the deadline is in 4 hours.',
      blockers: ['Slide template needs selection'],
      next_action: 'Outline the slide deck flow and create the structural skeleton.',
      analyzedAt: new Date().toISOString()
    }
  },
  {
    id: 'demo-2',
    title: 'Review production database security rules',
    description: 'Ensure Firestore rules prevent unauthorized access and require authentication. No data leak risk permitted.',
    deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
    priority: 'high',
    category: 'Security',
    impact: 4,
    dependencies: [],
    status: 'todo',
    completedAt: null,
    createdAt: new Date().toISOString(),
    userId: 'demo-user',
    urgencyScore: 72,
    aiAnalysis: {
      urgency_score: 72,
      reasoning: 'Security audits have severe impact if missed, but you still have overnight to finalize. One dependent task is blocked.',
      blockers: ['Auth setup needs validation'],
      next_action: 'Pull latest firestore.rules and review with security guidelines.',
      analyzedAt: new Date().toISOString()
    }
  },
  {
    id: 'demo-3',
    title: 'Refactor state manager & optimize rerenders',
    description: 'Split store states and memoize callbacks to ensure fluid 60FPS UI performance during drag and drop.',
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    priority: 'medium',
    category: 'Engineering',
    impact: 3,
    dependencies: ['demo-2'],
    status: 'todo',
    completedAt: null,
    createdAt: new Date().toISOString(),
    userId: 'demo-user',
    urgencyScore: 45
  },
  {
    id: 'demo-4',
    title: 'Write automated unit tests for Lifeline Score',
    description: 'Verify score bounds (0-100), time pressure caps, and blocking factors over extreme date differentials.',
    deadline: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(), // 4 days from now
    priority: 'low',
    category: 'Testing',
    impact: 2,
    dependencies: [],
    status: 'todo',
    completedAt: null,
    createdAt: new Date().toISOString(),
    userId: 'demo-user',
    urgencyScore: 24
  },
  {
    id: 'demo-5',
    title: 'Setup Google Cloud Run production environment',
    description: 'Initialize Docker registry, configure SSL certificate routing, and map 3000 port for nginx proxy ingress.',
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Overdue 2 hours
    priority: 'high',
    category: 'Infrastructure',
    impact: 5,
    dependencies: [],
    status: 'done',
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    urgencyScore: 100
  }
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: DEFAULT_STATS,
  loading: true,
  error: null,
  demoMode: true,
  isSyncing: false,

  setDemoMode: (enabled) => {
    set({ demoMode: enabled });
    if (enabled) {
      get().loadLocalTasks();
    }
  },

  loadLocalTasks: () => {
    try {
      const storedTasks = localStorage.getItem('lifeline_tasks');
      const storedStats = localStorage.getItem('lifeline_stats');
      
      let tasks = storedTasks ? JSON.parse(storedTasks) : DEMO_TASKS;
      const stats = storedStats ? JSON.parse(storedStats) : {
        ...DEFAULT_STATS,
        streak: 3, // Seeding a nice streak of 3 for demo-readiness!
        totalTasks: tasks.length,
        totalCompleted: tasks.filter((t: Task) => t.status === 'done').length
      };

      // Recalculate dynamic scores
      tasks = tasks.map((task: Task) => ({
        ...task,
        urgencyScore: calculateUrgencyScore(task, tasks)
      }));

      set({ tasks, stats, loading: false });
    } catch (e) {
      set({ tasks: DEMO_TASKS, stats: DEFAULT_STATS, error: 'Failed to load local data', loading: false });
    }
  },

  addTask: async (taskInput) => {
    const { demoMode, tasks, stats } = get();
    const id = demoMode ? 'local-' + Math.random().toString(36).substr(2, 9) : 'db-' + Math.random().toString(36).substr(2, 9);
    
    const newTask: Task = {
      ...taskInput,
      id,
      status: 'todo',
      completedAt: null,
      createdAt: new Date().toISOString(),
      userId: demoMode ? 'demo-user' : (auth?.currentUser?.uid || ''), // populated with current auth user if syncing
      urgencyScore: 0, // calculated next
    };

    const updatedTasks = [...tasks, newTask];
    // Dynamic score assignment
    const finalTasks = updatedTasks.map(t => ({
      ...t,
      urgencyScore: calculateUrgencyScore(t, updatedTasks)
    }));

    const newStats: UserStats = {
      ...stats,
      totalTasks: finalTasks.length
    };

    if (demoMode) {
      localStorage.setItem('lifeline_tasks', JSON.stringify(finalTasks));
      localStorage.setItem('lifeline_stats', JSON.stringify(newStats));
      set({ tasks: finalTasks, stats: newStats });
    } else {
      // Firebase sync handles writing to DB
      const user = db ? doc(collection(db, 'tasks'), id) : null;
      if (user) {
        await setDoc(user, { ...newTask, id });
      }
    }

    return id;
  },

  updateTask: async (id, updates) => {
    const { demoMode, tasks } = get();
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    const finalTasks = updatedTasks.map(t => ({
      ...t,
      urgencyScore: calculateUrgencyScore(t, updatedTasks)
    }));

    if (demoMode) {
      localStorage.setItem('lifeline_tasks', JSON.stringify(finalTasks));
      set({ tasks: finalTasks });
    } else {
      if (db) {
        const docRef = doc(db, 'tasks', id);
        await updateDoc(docRef, updates as any);
      }
    }
  },

  deleteTask: async (id) => {
    const { demoMode, tasks, stats } = get();
    const filteredTasks = tasks.filter(t => t.id !== id);
    const finalTasks = filteredTasks.map(t => ({
      ...t,
      urgencyScore: calculateUrgencyScore(t, filteredTasks)
    }));

    const newStats: UserStats = {
      ...stats,
      totalTasks: finalTasks.length,
      totalCompleted: finalTasks.filter(t => t.status === 'done').length
    };

    if (demoMode) {
      localStorage.setItem('lifeline_tasks', JSON.stringify(finalTasks));
      localStorage.setItem('lifeline_stats', JSON.stringify(newStats));
      set({ tasks: finalTasks, stats: newStats });
    } else {
      if (db) {
        await deleteDoc(doc(db, 'tasks', id));
      }
    }
  },

  toggleTaskStatus: async (id) => {
    const { demoMode, tasks, stats } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isNowDone = task.status !== 'done';
    const status: 'todo' | 'doing' | 'done' = isNowDone ? 'done' : 'todo';
    const completedAt = isNowDone ? new Date().toISOString() : null;

    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status, completedAt } : t);
    const finalTasks = updatedTasks.map(t => ({
      ...t,
      urgencyScore: calculateUrgencyScore(t, updatedTasks)
    }));

    // Calculate Streak & Stats
    let streak = stats.streak;
    let lastCompletedDate = stats.lastCompletedDate;
    
    if (isNowDone) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (lastCompletedDate) {
        const lastDate = new Date(lastCompletedDate);
        const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1; // reset streak if gap exists
        }
      } else {
        streak = 1;
      }
      lastCompletedDate = todayStr;
    }

    const totalCompleted = finalTasks.filter(t => t.status === 'done').length;
    
    // Maintain brief completions history array for Burndown charts
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const history = [...stats.history];
    const existingDay = history.find(h => h.date === todayLabel);
    if (existingDay) {
      existingDay.completedCount = isNowDone ? existingDay.completedCount + 1 : Math.max(0, existingDay.completedCount - 1);
    } else {
      history.push({ date: todayLabel, completedCount: isNowDone ? 1 : 0 });
    }

    const newStats: UserStats = {
      streak,
      lastCompletedDate,
      totalCompleted,
      totalTasks: finalTasks.length,
      history: history.slice(-7) // keep last 7 days
    };

    if (demoMode) {
      localStorage.setItem('lifeline_tasks', JSON.stringify(finalTasks));
      localStorage.setItem('lifeline_stats', JSON.stringify(newStats));
      set({ tasks: finalTasks, stats: newStats });
    } else {
      if (db) {
        // Update task status
        await updateDoc(doc(db, 'tasks', id), { status, completedAt });
        // Update user stats
        await setDoc(doc(db, 'user_stats', task.userId), newStats);
      }
    }
  },

  updateTaskAIAnalysis: async (id, analysis) => {
    await get().updateTask(id, { aiAnalysis: analysis });
  },

  recalculateScores: () => {
    const { tasks } = get();
    const finalTasks = tasks.map(t => ({
      ...t,
      urgencyScore: calculateUrgencyScore(t, tasks)
    }));
    set({ tasks: finalTasks });
  },

  resetStore: () => {
    set({ tasks: [], stats: DEFAULT_STATS, error: null });
  },

  syncWithFirestore: (userId) => {
    if (!db) {
      set({ error: 'Firebase not initialized', loading: false });
      return () => {};
    }

    set({ loading: true, isSyncing: true });

    // 1. Sync User Stats
    const statsDocRef = doc(db, 'user_stats', userId);
    getDoc(statsDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        set({ stats: docSnap.data() as UserStats });
      } else {
        setDoc(statsDocRef, DEFAULT_STATS);
      }
    });

    // 2. Sync Tasks
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fbTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        fbTasks.push(doc.data() as Task);
      });

      // Recalculate scores dynamically on incoming tasks
      const finalTasks = fbTasks.map(t => ({
        ...t,
        urgencyScore: calculateUrgencyScore(t, fbTasks)
      }));

      set({ tasks: finalTasks, loading: false });
    }, (error) => {
      set({ error: error.message, loading: false });
    });

    return () => {
      unsubscribe();
      set({ isSyncing: false });
    };
  }
}));
