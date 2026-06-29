import React from 'react';
import { useUIStore } from '../store/uiStore';
import { useTaskStore } from '../store/taskStore';
import UrgencyMeter from '../components/features/UrgencyMeter';
import TaskList from '../components/features/TaskList';
import VoiceInput from '../components/features/VoiceInput';
import AIAnalysisPanel from '../components/features/AIAnalysisPanel';
import AddTaskModal from '../components/features/AddTaskModal';
import { TaskInputForm } from '../components/features/TaskInputForm';
import { DashboardSummary } from '../components/features/DashboardSummary';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Search, Plus, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { searchQuery, categoryFilter, priorityFilter, statusFilter, setFilters, setAddTaskModalOpen } = useUIStore();
  const { tasks, addTask } = useTaskStore();

  const handleQuickSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    impact: number;
    deadline: string;
    dependencies: string[];
  }) => {
    try {
      await addTask({
        ...data,
        userId: 'demo-user'
      });
      toast.success('Task successfully added to your backlog!');
    } catch (err: any) {
      toast.error('Failed to add task.');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleFilterChange = (key: 'categoryFilter' | 'priorityFilter' | 'statusFilter', value: string) => {
    setFilters({ [key]: value });
  };

  const activeCategories = ['All', ...Array.from(new Set(tasks.map(t => t.category)))];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16 lg:pb-6">
      {/* Dynamic Floating Explainer for Judges on first visit */}
      <Card className="p-5 bg-gradient-to-r from-purple-950/30 to-cyan-950/20 border border-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full filter blur-xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white/95">Welcome to LIFELINE AI — Hackathon Vibe Check</h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                We've pre-seeded the backlog with real tasks so you can witness the proprietary **Lifeline Score™** algorithm in action immediately. Press the **Brain icon** on any task to trigger the real-time AI Urgency Analyzer!
              </p>
            </div>
          </div>
          <Button 
            variant="glass" 
            size="sm" 
            onClick={() => setAddTaskModalOpen(true)}
            className="self-start md:self-center shrink-0 border-purple-500/20 text-purple-300 font-bold"
          >
            Create Your Own Task
          </Button>
        </div>
      </Card>

      {/* Daily Performance Metrics Summary */}
      <DashboardSummary />

      {/* Grid: Urgency Meter on Left, Search + Dictation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 xl:col-span-7">
          <UrgencyMeter />
        </div>
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
          <Card className="p-5 flex flex-col gap-4 flex-1 justify-center">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search dynamic backlog by keywords..."
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] text-white placeholder-white/30 text-sm rounded-xl pl-11 pr-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-4xs uppercase tracking-widest text-white/30 font-bold font-mono">Status</span>
                <select
                  value={statusFilter}
                  onChange={e => handleFilterChange('statusFilter', e.target.value)}
                  className="bg-slate-900 text-white border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="All">All Tasks</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-4xs uppercase tracking-widest text-white/30 font-bold font-mono">Category</span>
                <select
                  value={categoryFilter}
                  onChange={e => handleFilterChange('categoryFilter', e.target.value)}
                  className="bg-slate-900 text-white border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                >
                  {activeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-4xs uppercase tracking-widest text-white/30 font-bold font-mono">Priority</span>
                <select
                  value={priorityFilter}
                  onChange={e => handleFilterChange('priorityFilter', e.target.value)}
                  className="bg-slate-900 text-white border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="All">All Base</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </Card>
          
          <VoiceInput />
        </div>
      </div>

      {/* Backlog & Quick Creator Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Task List (Left Column) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white/90">Task Backlog</h3>
            <Button 
              variant="glass" 
              size="sm" 
              onClick={() => setAddTaskModalOpen(true)}
              className="text-xs py-1.5 px-3 xl:hidden"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
          <TaskList />
        </div>

        {/* Quick Capture (Right Column) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white/90">Quick Capture</h3>
          </div>
          <Card className="p-5 border border-glass-border bg-white/[0.01]">
            <TaskInputForm onSubmit={handleQuickSubmit} />
          </Card>
        </div>
      </div>

      {/* AI Drawer and Creation Dialogs */}
      <AIAnalysisPanel />
      <AddTaskModal />
    </div>
  );
};
export default Dashboard;
